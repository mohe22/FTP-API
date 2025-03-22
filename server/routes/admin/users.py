from fastapi import APIRouter, Depends, HTTPException, status,Request,Query
from pydantic import BaseModel,EmailStr
from utils.utils import get_db_connection,add_activity
from utils.jwt import get_current_user
from typing import  Optional,List
import bcrypt
import sqlite3

router = APIRouter(prefix="/users", tags=["admin-users"])
class UpdateUserSecuritySettingsRequest(BaseModel):
    loginAttempts:int
    sessionTimeout:int
    twoFactorEnabled: bool 
    ipRestriction:bool
    allowedIPs: str

class UpdateUserPasswordRequest(BaseModel):
    old: str
    new: str
class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    location: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    is_admin: Optional[bool] = None
    status: Optional[str] = None
    groups: Optional[List[str]] = None 
    
class AddUserRequest(BaseModel):
    username: str
    password: str
    email: EmailStr
    location: str = None
    phone: str = None
    bio: str = None
    is_admin: bool = False

@router.post("/create",status_code=status.HTTP_201_CREATED)
def add_user(
    request:Request,
    create_user_data: AddUserRequest,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can add users"
        )
    hashed_password = bcrypt.hashpw(create_user_data.password.encode("utf-8"), bcrypt.gensalt())
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("BEGIN TRANSACTION")

        cursor.execute(
            """
            INSERT INTO users (username, hash_password, email, location, phone, bio, is_admin)
            VALUES (?,?,?,?,?, ?, ?)
            """,
            (
                create_user_data.username,
                hashed_password,
                create_user_data.email,
                create_user_data.location,
                create_user_data.phone,
                create_user_data.bio,
                create_user_data.is_admin
            )
        )
      
        user_id = cursor.lastrowid
        cursor.execute(
            """
                INSERT INTO user_groups (user_id, group_id)
                SELECT ?, id FROM groups WHERE group_name = ?
            """,
            (user_id, "Users")
        )
        add_activity(
            cursor=cursor,
            activity_type="User Management",
            details=f"Added user {create_user_data.username}",
            category="Administration",
            changed_by=current_user.get("user_id"),
            user_id=current_user.get("user_id"),
            request=request
        )
        connection.commit()
        return {"detail": "User added successfully", "user_id": user_id}
    except HTTPException:
        raise
    except sqlite3.IntegrityError as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add user"
        )
    finally:
        cursor.close()
        connection.close()
@router.get("/get")
def get_user(
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view users"
        )
    connection  = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.is_admin, 
                u.status,
                u.last_activity,
                u.created_at,
                GROUP_CONCAT(g.group_name, ', ') AS groups
            FROM users u
            LEFT JOIN user_groups ug ON u.id = ug.user_id
            LEFT JOIN groups g ON ug.group_id = g.id
            GROUP BY u.id
            """
        )
        rows = cursor.fetchall()
        users_with_groups = []
        for row in rows:
            users_with_groups.append({
                "id": row["id"],
                "username": row["username"],
                "email": row["email"],
                "is_admin": bool(row["is_admin"]),
                "last_activity": row["last_activity"],
                "status": row["status"],
                "created_at": row["created_at"],
                "groups": row["groups"].split(", ") if row["groups"] else []
            })
        return {"message": users_with_groups}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users and groups: {str(e)}"
        )
    except HTTPException:
        raise
    finally:
        cursor.close()
        connection.close()
@router.get("/get/{user_id}", status_code=status.HTTP_200_OK)
async def get_user_by_id(user_id: int, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view user details"
        )
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.is_admin, 
                u.status,
                u.last_activity,
                u.created_at,
                u.location,
                u.phone,
                u.bio,
                u.avatar,
                u.max_logged_in,
                u.session_time_out,
                u.Two_factor_auth,
                u.Allowed_ips,
                u.ip_restriction,
                GROUP_CONCAT(g.group_name, ', ') AS groups
            FROM users u
            LEFT JOIN user_groups ug ON u.id = ug.user_id
            LEFT JOIN groups g ON ug.group_id = g.id
            WHERE u.id = ?
            GROUP BY u.id
            """,
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        user_info = {
            "id": row["id"],
            "username": row["username"],
            "email": row["email"],
            "is_admin": bool(row["is_admin"]),
            "status": row["status"],
            "last_activity": row["last_activity"],
            "created_at": row["created_at"],
            "location": row["location"],
            "phone": row["phone"],
            "bio": row["bio"],
            "avatar": row["avatar"],
            "max_logged_in": row["max_logged_in"],
            "session_time_out": row["session_time_out"],
            "Two_factor_auth": bool(row["Two_factor_auth"]),
            "Allowed_ips": row["Allowed_ips"],
            "ip_restriction": bool(row["ip_restriction"]),
            
            "groups": row["groups"].split(", ") if row["groups"] else []
        }
        return {"message": user_info}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user"
        )
    finally:
        cursor.close()
        connection.close()


@router.delete("/delete/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(
    user_id: int,
    request: Request,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )

    connection = get_db_connection()
    cursor = connection.cursor()
    
    try:
        

        cursor.execute("BEGIN TRANSACTION")

        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        cursor.execute("DELETE FROM user_groups WHERE user_id = ?", (user_id,))

        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))

        add_activity(
            cursor=cursor,
            activity_type="User Management",
            details=f"Deleted user with ID {user_id}",
            category="Administration",
            changed_by=current_user.get("user_id"),
            user_id=current_user.get("user_id"),
            request=request
        )

        connection.commit()

        return {"detail": "User deleted successfully"}

    except HTTPException:
        connection.rollback()
        raise

    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user"
        )

    finally:
        cursor.close()
        connection.close() 






@router.get("/activity/{user_id}")
async def get_user_activity(user_id: int, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view user activity"
        )
    
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            """
            SELECT activity.*, users.username AS changed_by_username
            FROM activity
            LEFT JOIN users ON activity.changed_by = users.id
            WHERE activity.user_id = ?
            ORDER BY activity.activity_time DESC
            LIMIT 100;
            """,
            (user_id,)
        )
        data = cursor.fetchall()
        return {"message": data}
    except HTTPException:
        connection.rollback()
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting user activity"
        )
    finally:
        cursor.close()
        connection.close()



@router.patch("/update/{user_id}", status_code=status.HTTP_200_OK)
async def update_user(
    user_id: int,
    request: Request,
    update_data: UpdateUserRequest,
    current_user: dict = Depends(get_current_user)
):
    # Ensure only admins can update users
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update users"
        )

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
       

        cursor.execute("BEGIN TRANSACTION")

        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        update_fields = {}
        if update_data.username is not None:
            update_fields["username"] = update_data.username
        if update_data.email is not None:
            update_fields["email"] = update_data.email
        if update_data.location is not None:
            update_fields["location"] = update_data.location
        if update_data.phone is not None:
            update_fields["phone"] = update_data.phone
        if update_data.bio is not None:
            update_fields["bio"] = update_data.bio
        if update_data.is_admin is not None:
            update_fields["is_admin"] = int(update_data.is_admin)
        if update_data.status is not None:
            update_fields["status"] = update_data.status

        if update_fields:
            set_clause = ", ".join([f"{field} = ?" for field in update_fields])
            update_query = f"UPDATE users SET {set_clause} WHERE id = ?"
            update_values = list(update_fields.values()) + [user_id]
            cursor.execute(update_query, update_values)

            add_activity(
                cursor=cursor,
                activity_type="Modified Profile",
                details="Updated user profile",
                category="profile",
                request=request,
                user_id=user_id,
                changed_by=current_user.get("user_id")
            )

        if update_data.groups is not None:
            placeholders = ", ".join(["?"] * len(update_data.groups))
            cursor.execute(
                f"SELECT id, group_name FROM groups WHERE group_name IN ({placeholders})",
                update_data.groups,
            )
            valid_groups = cursor.fetchall()

            valid_group_names = {group["group_name"]: group["id"] for group in valid_groups}
            invalid_groups = [group for group in update_data.groups if group not in valid_group_names]

            if invalid_groups:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"The following groups do not exist: {', '.join(invalid_groups)}"
                )

            cursor.execute("DELETE FROM user_groups WHERE user_id = ?", (user_id,))

            if valid_groups:
                group_ids = [valid_group_names[group] for group in update_data.groups]
                cursor.executemany(
                    "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)",
                    [(user_id, group_id) for group_id in group_ids],
                )

                add_activity(
                    cursor=cursor,
                    activity_type="Modified Groups",
                    details=f"Updated groups: {', '.join(update_data.groups)}",
                    category="group",
                    request=request,
                    user_id=user_id,
                    changed_by=current_user.get("user_id")
                )

        connection.commit()

        return {"detail": "User updated successfully"}

    except sqlite3.IntegrityError as e:

        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )

    except Exception as e:

        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

    finally:
      
        cursor.close()
       
        connection.close()

@router.get("/get-scroll", response_model=List[dict])
async def get_all_users(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(10, description="Number of records to return")
):
   
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT id, username, avatar
            FROM users
            LIMIT ? OFFSET ?
            """,
            (limit, skip)
        )
        users = cursor.fetchall()
        return [dict(user) for user in users]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="An error occurred while fetching users."
        )

    finally:
        cursor.close()
        connection.close()

@router.patch("/update-password/{user_id}", status_code=status.HTTP_200_OK)
async def update_password(
    user_id: int,
    request: Request,
    update_data: UpdateUserPasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin") and current_user.get("id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own password"
        )
    if current_user.get("is_admin") and current_user.get("id") == user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot update their own password"
        )

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("BEGIN TRANSACTION")
        cursor.execute("SELECT hash_password FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        if not bcrypt.checkpw(update_data.old.encode("utf-8"), user["hash_password"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Old password is incorrect"
            )

        hashed_new_password = bcrypt.hashpw(update_data.new.encode("utf-8"), bcrypt.gensalt())
        cursor.execute(
            "UPDATE users SET hash_password = ? WHERE id = ?",
            (hashed_new_password, user_id)
        )
        add_activity(
            cursor=cursor,
            activity_type="Password Update",
            details="User password updated",
            category="Security",
            changed_by=current_user.get("user_id"),
            request=request,
            user_id=user_id
        )
        connection.commit()

        return {"detail": "Password updated successfully"}
    except HTTPException:
        connection.rollback()
        raise

    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the password"
        )

    finally:
        cursor.close()
        connection.close()
@router.patch("/update-security-settings/{user_id}", status_code=status.HTTP_200_OK)
async def update_security_settings(
    user_id: int,
    request: Request,
    user_data: UpdateUserSecuritySettingsRequest,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("is_admin") and current_user.get("id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own security settings"
        )
    if current_user.get("is_admin") and current_user.get("id") == user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admins cannot update their own security settings"
        )

    connection = get_db_connection()
    cursor = connection.cursor()
    try:     

        cursor.execute("BEGIN TRANSACTION")

        cursor.execute("SELECT id FROM users WHERE id = ?", (user_id,))
        user = cursor.fetchone()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        cursor.execute(
            """
            UPDATE users 
            SET 
                max_logged_in = ?, 
                session_time_out = ?, 
                Two_factor_auth = ?, 
                Allowed_ips = ?, 
                ip_restriction = ? 
            WHERE id = ?
            """,
            (
                user_data.loginAttempts,
                user_data.sessionTimeout,
                user_data.twoFactorEnabled,
                user_data.allowedIPs,
                user_data.ipRestriction,
                user_id
            )
        )

        add_activity(
            cursor,
            activity_type="Modify Security Updates",
            details="Security settings updated",
            category="Security Updated",
            changed_by=current_user.get("user_id"),
            request=request,
            user_id=user_id
        )

        connection.commit()

        return {"detail": "Security settings updated successfully"}

    except sqlite3.IntegrityError as e:
      
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data provided"
        )

    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating security settings"
        )

    finally:
        cursor.close()
        connection.close()