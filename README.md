# FTP Server using FastAPI and React

This project is a high-performance FTP server built with FastAPI for the backend and React for the frontend. It supports parallel uploads and downloads, group-based permission management, and an admin dashboard for user and system management.

![Screenshot 2025-03-22 031910](https://github.com/user-attachments/assets/1ed73093-68ac-4af4-959e-7af2c2f7f185)
![Screenshot 2025-03-22 031816](https://github.com/user-attachments/assets/6108d731-9f95-4fd2-9c6b-a48e83549920)
![Screenshot 2025-03-22 031723](https://github.com/user-attachments/assets/3195d669-545c-4305-8799-9db2e40cdfd2)
![Screenshot 2025-03-22 031705](https://github.com/user-attachments/assets/c6b7f615-6cd8-4336-98a0-5c68161af9e0)
![Screenshot 2025-03-22 031620](https://github.com/user-attachments/assets/50fb6345-4f9c-41ce-bf5c-c9f48827cc72)
![Screenshot 2025-03-22 031539](https://github.com/user-attachments/assets/f2da1e7a-9635-42b3-bc25-05fda23c8d82)
![Screenshot 2025-03-22 031513](https://github.com/user-attachments/assets/28c42f89-a87e-4afe-916b-cd64e667dbc9)
![Screenshot 2025-03-22 031427](https://github.com/user-attachments/assets/feaf22db-e5b0-4672-bc47-038fe3f7c458)
![Screenshot 2025-03-22 031350](https://github.com/user-attachments/assets/7a53157b-bed7-4fd7-ad68-58d8e7d301ed)
![Screenshot 2025-03-22 032414](https://github.com/user-attachments/assets/13ed6d81-a593-429e-af46-331daf46b2cd)
![Screenshot 2025-03-22 032356](https://github.com/user-attachments/assets/72c5bfca-fa5d-40d2-93ba-afec28874e6d)
![Screenshot 2025-03-22 032332](https://github.com/user-attachments/assets/8af46669-5115-4de8-bd38-8a41ab4238ac)
![Screenshot 2025-03-22 032309](https://github.com/user-attachments/assets/25d9b4c7-9868-4cc2-801d-df500ab4d08a)
![Screenshot 2025-03-22 032239](https://github.com/user-attachments/assets/c72918cb-eccb-4c9c-a23b-902e3c6705f5)
![Screenshot 2025-03-22 032201](https://github.com/user-attachments/assets/9a5f747a-3ff5-43c0-845c-2043919a7ca8)
![Screenshot 2025-03-22 032144](https://github.com/user-attachments/assets/f12c4afb-26a1-4dad-a07a-f9c7d7994f87)
![Screenshot 2025-03-22 032128](https://github.com/user-attachments/assets/f3e52d2c-97e5-4406-8926-93037b6f3c1e)
![Screenshot 2025-03-22 032104](https://github.com/user-attachments/assets/6bdad1dd-cb17-4065-a4ec-5338376c6952)
![Screenshot 2025-03-22 032051](https://github.com/user-attachments/assets/a31195e5-0023-4525-a0c1-8cb2c37d1ac8)
![Screenshot 2025-03-22 032028](https://github.com/user-attachments/assets/012e72f2-bd6e-43b9-a57b-1408d1ba23f0)
![Screenshot 2025-03-22 031957](https://github.com/user-attachments/assets/aa9edc0e-481f-4d6c-afcb-89225b1d55b7)
![Screenshot 2025-03-22 031928](https://github.com/user-attachments/assets/6f8b729c-8532-4925-9c73-b90932f7c2b3)


## Features
- Parallel file uploads and downloads for fast performance.
- NTFS-like group-based permission system.
- File operations: upload, download, delete, move, and drag & drop (based on permissions).
- Admin dashboard with user and group management features:
  - Create accounts and configure user settings.
  - Enable two-factor authentication.
  - Set login attempt limits.
  - Define session timeout duration.
  - Reset passwords and update user profiles.
  - Create and manage user groups.
  - Edit group permissions.
  - Add/remove users from groups.

## Installation

### Backend Setup (FastAPI)
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ftp-fastapi.git
   cd ftp-fastapi
   ```
2.Create and activate a virtual environment:
```bash
 python -m venv venv
.\venv\Scripts\Activate.ps1
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the server directory and add the following environment variables:
   ```env
   SHARED_FOLDER=/path/to/shared/folder
   FRONTEND_URL=http://ip:3000
   SECRET_KEY=your_secret_key

   SMTP_SERVER=smtp.example.com
   SMTP_PORT=587
   SMTP_USERNAME=your_smtp_username
   SMTP_PASSWORD=your_smtp_password
   ```
4. Create a `.env` file in the client:
   ```env
     VITE_BACKEND_URL="http://192.168.0.72:8000"
   ```
5. Run the server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

### Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Upload & Download Implementation

### Uploading Files in Chunks
The API uploads files in chunks to enhance performance and allow large file uploads.

```python
@router.post("/upload-chunk")
async def upload_chunk(
    file_id: str = Query(..., description="Unique identifier for the file"),
    chunk_number: int = Query(..., description="Current chunk number"),
    total_chunks: int = Query(..., description="Total number of chunks"),
    path: str = Query(default=Config.SHARED_FOLDER, description="The directory path to store the file"),
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
            await reassemble_file(file_id, total_chunks, full_path, current_user.get("user_id"))

        return {"status": "success", "message": f"Chunk {chunk_number} uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
```

### Downloading Files with Range Requests
Supports partial downloads for large files.

```python
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
            detail="You do not have permission to download this file",
        )
    try:
        file_path = os.path.join(full_path, file_name)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        file_size = os.path.getsize(file_path)
        range_header = request.headers.get("Range")

        if not range_header:
            return FileResponse(
                file_path,
                headers={
                    "Content-Disposition": f"attachment; filename={file_name}",
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(file_size),
                },
                media_type="application/octet-stream",
            )

        start, end = 0, file_size - 1
        range_parts = range_header.replace("bytes=", "").split("-")
        start = int(range_parts[0])
        end = int(range_parts[1]) if range_parts[1] else file_size - 1

        if start >= file_size or end >= file_size or start > end:
            raise HTTPException(status_code=416, detail="Requested range not satisfiable")

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

        return StreamingResponse(file_stream(), status_code=206, headers=headers, media_type="application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```!




