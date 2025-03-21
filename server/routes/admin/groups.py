from fastapi import APIRouter, Depends, HTTPException, status,Request
from pydantic import BaseModel
from utils.utils import get_db_connection,add_activity
from utils.jwt import get_current_user
from typing import  Optional,List
import sqlite3

router = APIRouter(prefix="/groups", tags=["admin-groups"])
ALLOWED_PERMISSIONS = {
    "Full Control",
    "Modify",
    "Read & Execute",
    "Read",
    "Write",
    "Delete",
}
class AddUsersToGroupRequest(BaseModel):
    user_ids: List[int]
class GroupCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None

class UpdateGroupPermissionsRequest(BaseModel):
    permissions: List[str]
class UpdateGroupRequest(BaseModel):
    group_name: str
    description: str
@router.delete("/delete/{group_id}", status_code=status.HTTP_200_OK)
async def delete_group(
    group_id: int,
    request:Request,
    current_user: dict = Depends(get_current_user),
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete groups"
        )
    db = get_db_connection()
    cursor = db.cursor()
    try:
     
            cursor.execute("BEGIN TRANSACTION")

            cursor.execute("SELECT id, group_name FROM groups WHERE id = ?", (group_id,))
            group =  cursor.fetchone()
            if not group:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Group not found"
                )

            cursor.execute("DELETE FROM user_groups WHERE group_id = ?", (group_id,))
            cursor.execute("DELETE FROM groups WHERE id = ?", (group_id,))
            
            add_activity(
                cursor=cursor,
                activity_type="Group Management",
                details=f"Deleted group with ID {group["group_name"]}",
                category="Administration",
                changed_by=current_user.get("user_id"),
                user_id=current_user.get("user_id"),
                request=request
            )

            db.commit()
            return {"detail": "Group deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error deleting group"
        )
    finally:
        cursor.close()
        db.close()

@router.post("/create",status_code=status.HTTP_201_CREATED)
async def add_group(
    group_data: GroupCreateRequest,
    request:Request,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete groups"
        )
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO groups (group_name, Description)
            VALUES (?, ?)
            """,
            (group_data.name, group_data.description)
        )
        connection.commit()
        add_activity(
            cursor=cursor,
            activity_type="Group Management",
            details=f"Created new group: {group_data.name}",
            category="Administration",
            changed_by=current_user.get("user_id") ,
            user_id=current_user.get("user_id"),
            request=request
        )
        return {"message": "Group created successfully", "group_name": group_data.name}
    except sqlite3.IntegrityError as e:
        connection.rollback()
        if "UNIQUE constraint failed: groups.group_name" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group name already exists. Please choose a different name."
            )
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
    finally:
        cursor.close()
        connection.close()


@router.get("/get", status_code=status.HTTP_200_OK)
async def get_groups(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view groups"
        )
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT id, group_name
            FROM groups
            """
        )
        rows = cursor.fetchall()
        groups = [{"id": row["id"], "group_name": row["group_name"]} for row in rows]
        return {"message": groups}
    except Exception as e:
        raise HTTPException(    
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching groups: {str(e)}"
        )
    finally:
        cursor.close()
        connection.close()
@router.patch("/update/{group_id}", status_code=status.HTTP_200_OK)
async def update_group(
    group_id: int,
    request:Request,
    group_data: UpdateGroupRequest,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update groups"
        )
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            UPDATE groups
            SET group_name = ?, Description = ?
            WHERE id = ?
            """,
            (group_data.group_name, group_data.description, group_id)
        )
        add_activity(
            cursor=cursor,
            activity_type="Group Management",
            details=f"Updated group: {group_data.group_name}",
            category="Administration",
            changed_by=current_user.get("user_id"),
            user_id=current_user.get("user_id"),
            request=request
        )
        connection.commit()
        return {"message": "Group updated successfully"}
    except sqlite3.IntegrityError as e:
        connection.rollback()
        if "UNIQUE constraint failed: groups.group_name" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Group name already exists. Please choose a different name."
            )
      
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating group"
        )
    finally:
        cursor.close()
        connection.close()
@router.get("/get/{group_id}", status_code=status.HTTP_200_OK)
async def get_group_by_id(
    group_id: int,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view group details"
        )

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
                SELECT group_name, Description, created_at
                FROM groups
                WHERE id = ?
            """,
            (group_id,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Group not found"
            )
        group_info = {
            "group_name": row["group_name"],
            "description": row["Description"],
            "created_at": row["created_at"],
        }

        return {"message": group_info}
    except Exception as e:
     
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching group"
        )
    
    finally:
        cursor.close()
        connection.close()
@router.get("/get-with-details",status_code=status.HTTP_200_OK)
async def get_all_groups(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view groups"
        )
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT 
                g.id,
                g.group_name,
                g.Description,
                g.created_at,
                COUNT(ug.user_id) AS members_count
            FROM groups g
            LEFT JOIN user_groups ug ON g.id = ug.group_id
            GROUP BY g.id
            ORDER BY g.created_at DESC
            """
        )
        groups = cursor.fetchall()
        return {"message": groups}
    except Exception as e:
        raise HTTPException(    
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching groups"
        )
    finally:
        cursor.close()
        connection.close()




@router.get("/get-with-members/{group_id}", status_code=status.HTTP_200_OK)
async def get_group_members(
    group_id: int,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view group members"
        )
    
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("""
            SELECT u.id, u.avatar, u.username, u.email, u.phone, u.location,u.status
            FROM users u
            INNER JOIN user_groups ug ON u.id = ug.user_id
            WHERE ug.group_id = ?
        """, (group_id,))
        members = cursor.fetchall()
        member_list = []
        for member in members:
            member_list.append({
                "id": member["id"],
                "avatar": member["avatar"],
                "username": member["username"],
                "email": member["email"],
                "phone": member["phone"],
                "location": member["location"],
                "status": member["status"]
            })
        return {"message":member_list}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching group members"
        )
    
    finally:
        cursor.close()
        connection.close()

@router.post("/add-user/{group_id}", status_code=status.HTTP_200_OK)
async def add_users_to_group(
    group_id: int,
    data: AddUsersToGroupRequest,
    request:Request,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add users to groups"
        )

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute("SELECT id FROM groups WHERE id = ?", (group_id,))
        group = cursor.fetchone()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Group with ID {group_id} not found"
            )

        for user_id in data.user_ids:
            cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"User with ID {user_id} not found"
                )

        for user_id in data.user_ids:
            cursor.execute(
                "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)",
                (user_id, group_id), 
            )

        add_activity(
            cursor=cursor,
            activity_type="User Management",
            details=f"Added users {data.user_ids} to group {group_id}",
            category="Administration",
            changed_by=current_user.get("user_id"),
            user_id=current_user.get("user_id"),
            request=request
        )
        connection.commit()


        return {"detail": "Users added to group successfully"}

    except sqlite3.IntegrityError as e:
        connection.rollback()
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more users are already in the group"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding users to group: {str(e)}"
        )

    finally:
        cursor.close()
        connection.close()

@router.patch("/update-permissions/{group_id}", status_code=status.HTTP_200_OK)
async def update_group_permissions(
    group_id: int,
    permissions_request: UpdateGroupPermissionsRequest,
    request:Request,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update group permissions"
        )

    invalid_permissions = [
        permission for permission in permissions_request.permissions
        if permission not in ALLOWED_PERMISSIONS
    ]
    if invalid_permissions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid permissions: {invalid_permissions}. Allowed permissions are: {ALLOWED_PERMISSIONS}"
        )
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
       
        cursor.execute(
            "DELETE FROM group_permissions WHERE group_id = ?",
            (group_id,)
        )

        for permission in permissions_request.permissions:
            cursor.execute(
                "INSERT INTO group_permissions (group_id, permission) VALUES (?, ?)",
                (group_id, permission),
            )

        add_activity(
            cursor=cursor,
            activity_type="Update Group Permissions",
            details=f"Updated group permissions for group: {group_id}",
            category="Administration",
            changed_by=current_user.get("user_id"),
            user_id=current_user.get("user_id"),
            request=request
        )
        connection.commit()
        return {"detail": "Permissions updated successfully"}
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating group permissions"
        )
    finally:
        cursor.close()
        connection.close()


@router.get("/get-with-permissions/{group_id}", response_model=dict)
async def get_group_permissions(
    group_id: int,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can get group permissions"
        )
    
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT g.id AS group_id, g.group_name, g.Description, gp.permission
            FROM groups g
            LEFT JOIN group_permissions gp ON g.id = gp.group_id
            WHERE g.id = ?
            """,
            (group_id,)
        )
        rows = cursor.fetchall()

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Group with ID {group_id} not found"
            )

        group_details = {
            "group_id": rows[0]["group_id"],
            "group_name": rows[0]["group_name"],
            "description": rows[0]["Description"],
            "permissions": [row["permission"] for row in rows if row["permission"]]
        }

     

        return group_details

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching group permissions."
        )

    finally:
        cursor.close()
        connection.close()