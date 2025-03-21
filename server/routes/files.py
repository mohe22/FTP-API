import os
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    File,
    status,
    Request,
)
import shutil
from fastapi.responses import FileResponse, StreamingResponse
from utils.permissions import add_file_permissions,can_access_file
import aiofiles
from utils.jwt import get_current_user
from utils.utils import get_db_connection,add_activity
from pydantic import BaseModel
from typing import  List

from utils.file_utils import (
    list_files,
    validate_and_join_path,
    create_directory,
    delete_recursive,
    delete_folder,
    get_file_details

)
from config import Config


router = APIRouter()
ALLOWED_PERMISSIONS = {
    "Full Control",
    "Modify",
    "Read & Execute",
    "Read",
    "Write",
    "Delete",
}

@router.get("/get-file-groups", status_code=status.HTTP_200_OK)
async def get_file_groups(
    path: str = Query(..., description="The file path"),
    current_user: dict = Depends(get_current_user),
):
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized"
        )

    full_path = validate_and_join_path(path)
    if not full_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid path"
        )

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "SELECT id FROM files WHERE file_path = ?",
            (full_path,)
        )
        file_row = cursor.fetchone()
        if not file_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        file_id = file_row["id"]

        cursor.execute("SELECT group_name FROM groups")
        all_groups = cursor.fetchall()
        all_group_names = [group["group_name"] for group in all_groups]

        cursor.execute(
            """
            SELECT g.group_name
            FROM file_groups fg
            JOIN groups g ON fg.group_id = g.id
            WHERE fg.file_id = ?
            """,
            (file_id,)
        )
        file_groups = cursor.fetchall()
        file_group_names = [group["group_name"] for group in file_groups]

        group_status = {
            group_name: group_name in file_group_names
            for group_name in all_group_names
        }
        return {"message": group_status}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving file groups: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()



class UpdateGroupPermissionsRequest(BaseModel):
    groups: List[dict]  

@router.patch("/update-file-groups", status_code=status.HTTP_200_OK)
async def update_file_groups(
    data: UpdateGroupPermissionsRequest,
    request: Request,
    path: str = Query(..., description="The file path"),
    current_user: dict = Depends(get_current_user),
):
 
    full_path = validate_and_join_path(path)
    if not full_path:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid path"
        )

    if not can_access_file(
        file_path=full_path,
        user_id=current_user.get("user_id"),
        action="Full Control",
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this file's groups"
        )

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            "SELECT id FROM files WHERE file_path = ?",
            (full_path,)
        )
        file_row = cursor.fetchone()
        if not file_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        file_id = file_row["id"]

        for group in data.groups:
            group_name = group["group_name"]
            is_associated = group["is_associated"]

            cursor.execute(
                "SELECT id FROM groups WHERE group_name = ?",
                (group_name,)
            )
            group_row = cursor.fetchone()
            if not group_row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Group '{group_name}' not found"
                )
            group_id = group_row["id"]

            if is_associated:
                cursor.execute(
                    "INSERT OR IGNORE INTO file_groups (file_id, group_id) VALUES (?, ?)",
                    (file_id, group_id),
                )
            else:
                cursor.execute(
                    "DELETE FROM file_groups WHERE file_id = ? AND group_id = ?",
                    (file_id, group_id),
                )

        add_activity(
            cursor=cursor,
            activity_type="Update File Groups",
            details=f"Updated groups for file: {full_path}",
            category="Administration",
            changed_by=current_user.get("user_id"),
            user_id=current_user.get("user_id"),
            request=request
        )

        connection.commit()
        return {"detail": "File group permissions updated successfully"}
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating file group permissions: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()

@router.get("/get-file",status_code=status.HTTP_200_OK)
async def get_file(
    path: str = Query(..., description="The file path"),
    current_user=Depends(get_current_user),

):
    full_path = validate_and_join_path(path)

    if not full_path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid path")
    
    allowed = can_access_file(
        file_path=full_path,
        user_id=current_user.get("user_id"),
        action="Read",
    )

  
    if allowed is False or allowed is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this directory",
        )

    fileDeta = get_file_details(full_path)
    if fileDeta is None or fileDeta is False:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    return fileDeta


@router.get("/list-directory")
async def list_directory(
    path: str = Query(
        default=Config.SHARED_FOLDER, description="The directory path to list"
    ),
    current_user=Depends(get_current_user),
):
    
    full_path = validate_and_join_path(path)
    if not full_path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid path")

    allowed = can_access_file(
        file_path=full_path,
        user_id=current_user.get("user_id"),
        action="Read",
    )


 
  
    if allowed is False or allowed is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this directory",
        )

    files = list_files(full_path).split("\n")
    clean_files = []

    for file in files:
        clean = file.replace("\r", "")
        if clean:
            file_info = clean.split("\t")
            if len(file_info) >= 7:  
                file_name = file_info[5] 
                if not file_name.endswith(".part"):
                    file_details = {
                        "time": file_info[4],  
                        "name": file_name,    
                        "size": file_info[3],  
                        "is_folder": file_info[6].lower() == "true", 
                    }
                    clean_files.append(file_details)
    return {"message": clean_files}

@router.post("/upload-chunk")
async def upload_chunk(
    file_id: str = Query(..., description="Unique identifier for the file"),
    chunk_number: int = Query(..., description="Current chunk number"),
    total_chunks: int = Query(..., description="Total number of chunks"),
    path: str = Query(
        default=Config.SHARED_FOLDER, description="The directory path to list"
    ),
    chunk_data: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)

):  
    
    full_path = validate_and_join_path(path)
    if not full_path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid path")
    
    allowed = can_access_file(
        file_path=full_path,
        user_id=current_user.get("user_id"),
        action="Write",
    )

    if allowed is False or allowed is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload chunks to this file",
        )
    try:
        chunk_path = os.path.join(full_path, f"{file_id}_chunk_{chunk_number}.part")

        async with aiofiles.open(chunk_path, "wb") as f:
            content = await chunk_data.read()
            await f.write(content)

        if chunk_number == total_chunks - 1:          
            await reassemble_file(file_id, total_chunks, full_path,current_user.get("user_id"))       
                 
        return {
            "status": "success",
            "message": f"Chunk {chunk_number} uploaded successfully",
        }
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


async def reassemble_file(file_id: str, total_chunks: int, path: str,user_id:int):
    try:
        full_file_path = os.path.join(path, file_id)
    
        async with aiofiles.open(full_file_path, "wb") as final_file:
            for i in range(total_chunks):
                chunk_path = os.path.join(path, f"{file_id}_chunk_{i}.part")
                async with aiofiles.open(chunk_path, "rb") as chunk:
                    content = await chunk.read()
                    await final_file.write(content)
                os.remove(chunk_path)
        add_file_permissions(
            file_path=full_file_path,
            owner_id=user_id,
        )  



    except Exception as e:
        print("Error reassembling file:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/download")
async def download_file(
    file_name: str = Query(...),
    path: str = Query(default=Config.SHARED_FOLDER),
    current_user: dict = Depends(get_current_user),
    request: Request = None,
):
    full_path = validate_and_join_path(path)

    if not full_path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid path")
    
    allowed = can_access_file(
        file_path=full_path,
        user_id=current_user.get("user_id"),
        action="Read",
    )

    if allowed is False or allowed is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload chunks to this file",
        )
    try:
        file_path = os.path.join(full_path, file_name)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        file_size = os.path.getsize(file_path)
        range_header = request.headers.get("Range")

        # Checks if the Range header is present in the request. This header is used for partial downloads (e.g., bytes=0-999).
        if not range_header:
            return FileResponse(
                file_path,
                headers={
                    "Content-Disposition": f"attachment; filename={file_name}",
                    "Accept-Ranges": "bytes",  # Informs the client that the server supports range requests.
                    "Content-Length": str(file_size),
                },
                media_type="application/octet-stream",
            )

        start, end = 0, file_size - 1
        range_parts = range_header.replace("bytes=", "").split(
            "-"
        )  # range_header.replace("bytes=", "").split("-"): Extracts the start and end bytes from the Range header (e.g., bytes=999-999*2 → ["0", "999"]).
        start = int(range_parts[0])
        end = int(range_parts[1]) if range_parts[1] else file_size - 1

        if start >= file_size or end >= file_size or start > end:
            raise HTTPException(
                status_code=416, detail="Requested range not satisfiable"
            )

        content_length = end - start + 1

        async def file_stream():
            async with aiofiles.open(file_path, "rb") as file:
                await file.seek(start)
                remaining_bytes = content_length
                while remaining_bytes > 0:
                    chunk_size = min(8192, remaining_bytes)
                    chunk = await file.read(chunk_size)
                    if not chunk:
                        break
                    yield chunk
                    remaining_bytes -= chunk_size

        headers = {
            "Content-Disposition": f"attachment; filename={file_name}",
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(content_length),
            "Accept-Ranges": "bytes",
        }

        return StreamingResponse(
            file_stream(),
            status_code=206,
            headers=headers,
            media_type="application/octet-stream",
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/create-directory")
async def create_director(
    path: str = Query(description="The directory path to list"),
    current_user: dict = Depends(get_current_user)

):
    file_path = validate_and_join_path(path)
    if not file_path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid path")
    parent_folder_path = os.path.dirname(file_path)

    allowed = can_access_file(
        file_path=parent_folder_path,
        user_id=current_user.get("user_id"),
        action="Write",
    )

    if allowed is False or allowed is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload chunks to this file",
        )

    if os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="Directory already exists")
    create_directory(file_path)

    add_file_permissions(file_path=file_path, owner_id=current_user.get("user_id"))
    return {
        "message": "Directory created successfully",
        "file_path": file_path,
    }


@router.delete("/delete")
async def delete(
    path: str = Query(default="", description="The directory path to list"),
    force: bool = Query(default=False, description="Force delete non-empty folder"),
    current_user=Depends(get_current_user),
):
    file_path = validate_and_join_path(path)
    if not file_path:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid path")
    
    allowed = can_access_file(
        file_path=file_path,
        user_id=current_user.get("user_id"),
        action="Delete",
    )

    if allowed is False or allowed is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload chunks to this file",
        )
    


    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File or folder not found")

    if os.path.isdir(file_path):
        if os.listdir(file_path) and not force:
            raise HTTPException(
                status_code=400, detail="Folder is not empty. Cannot delete."
            )
        if force:
            delete_recursive(file_path)
            return {
                "message": "Folder and its contents deleted successfully",
                "file_path": file_path,
            }



    if os.path.isfile(file_path):
        os.remove(file_path)
    else:
        delete_folder(file_path)

    
    delete_file(file_path, current_user.get("user_id"))
    return {
        "message": "File or folder deleted successfully",
        "file_path": file_path,
    }

def delete_file(file_path: str, user_id: int):

    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
      
   
        # Delete file from the database
        cursor.execute(
            """
            DELETE FROM files WHERE file_path = ?
            """,
            (file_path,)
        )


        add_activity(
            cursor=cursor,
            activity_type="File Management",
            details=f"Deleted file: {file_path}",
            category="File Management",
            user_id=user_id,
            changed_by=user_id
        )
      
        connection.commit()
        return True
    
    except Exception as e:
        connection.rollback()
        print(f"Error deleting file: {e}")
        return False
    
    finally:
        connection.close()

@router.post("/move")
async def move(
    fromPath: str = Query(default="", description="The source path to move from"),
    toPath: str = Query(default="", description="The destination path to move to"),
    force: bool = Query(default=False, description="Force move, overwriting existing files or directories"),
    user_data=Depends(get_current_user),
):
    fromPath_root = validate_and_join_path(fromPath)
    if not fromPath_root:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid path")
    
    allowed = can_access_file(
        file_path=fromPath_root,
        user_id=user_data.get("user_id"),
        action="Write",
    )

    if allowed is False or allowed is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to upload chunks to this file",
        )
    
    # Validate and construct full paths
    toPath_root = validate_and_join_path(toPath)

    # Check if the source path exists
    if not os.path.exists(fromPath_root):
        raise HTTPException(status_code=404, detail="Source path does not exist")

    if not os.path.isdir(toPath_root):
        raise HTTPException(status_code=400, detail="Source path is not a directory")
    try:
        shutil.move(fromPath_root, toPath_root)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to move: {str(e)}")

    return {"message": "Move operation successful", "fromPath": fromPath_root, "toPath": toPath_root}