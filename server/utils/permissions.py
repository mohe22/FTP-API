from typing import Optional
from utils.utils import get_db_connection
from config import Config
import os



def get_parent_file(cursor, file_path: str):
    arr = file_path.split("\\")[:-1]
    path = "{}".format("\\".join(arr))    
    try:
        cursor.execute(
            """
            SELECT id
            FROM files
            WHERE file_path = ?
            """,
            (path,),
        )
        result = cursor.fetchone()
        return result["id"] 
    except Exception as e:
        return 1



def can_access_file(file_path: str, user_id: int, action: str) -> bool:
    """
        How it work?
        --------------
        File Ownership: owner of the file, they automatically have full control over the file.
        Group Permissions:the user's group memberships are checked to determine if they inherit any permissions from the groups they belong to.
        File-Level Permissions:The permissions assigned to the file's associated groups are checked first. If the user belongs to a group that has the required permission, access is granted.
        Parent Folder Permissions:If no permissions are found at the file level, the function checks the permissions of the parent folder. If the user inherits the required permission from the parent folder, access is granted.
        Permission Hierarchy:Permissions are evaluated in a hierarchical manner (e.g., Full Control includes all permissions, Modify includes Read, Write, etc.).    
    """
  
    if file_path == Config.SHARED_FOLDER and action == "Read":
        return True
    
    
    connection = get_db_connection()
    cursor = connection.cursor()  


    try:
        # Get file details
        cursor.execute(
            """
            SELECT id, owner_id, parent_id
            FROM files
            WHERE file_path = ?
            """,
            (file_path,),
        )
        file = cursor.fetchone()

        if file is None:
            return False

        file_id, owner_id, parent_id = file['id'], file['owner_id'], file['parent_id']

        # If the user is the owner, they have full control
        if user_id == owner_id:
            return True

        # Get the user's groups
        cursor.execute(
            """
            SELECT group_id
            FROM user_groups
            WHERE user_id = ?
            """,
            (user_id,),
        )
        user_groups = [row['group_id'] for row in cursor.fetchall()]

        # Get permissions for the file's groups
        cursor.execute(
            """
            SELECT group_id, permission
            FROM group_permissions
            WHERE group_id IN (
                SELECT group_id
                FROM file_groups
                WHERE file_id = ?
            )
            """,
            (file_id,),
        )
        file_permissions = cursor.fetchall()
     
        # Check if the user has the required permission through file groups
        for perm in file_permissions:
            if perm['group_id'] in user_groups:
                if _has_permission(perm['permission'], action):
                    return True

        if parent_id:
            cursor.execute(
                """
                SELECT group_id, permission
                FROM group_permissions
                WHERE group_id IN (
                    SELECT group_id
                    FROM file_groups
                    WHERE file_id = ?
                )
                """,
                (parent_id,),
            )
            parent_permissions = cursor.fetchall()
         
            # Check if the user has the required permission through parent folder groups
            for perm in parent_permissions:
                if perm['group_id'] in user_groups:
                    if _has_permission(perm['permission'], action):
                        return True

        return False

    except Exception as e:
        print(f"Error checking file access: {e}")
        return False
    finally:
        cursor.close()
        connection.close()


def _has_permission(assigned_permission: str, required_action: str) -> bool:

    permission_hierarchy = {
        'Full Control': ['Full Control', 'Modify', 'Read & Execute', 'Read', 'Write', 'Delete'],
        'Modify': ['Modify', 'Read & Execute', 'Read', 'Write', 'Delete'],
        'Read & Execute': ['Read & Execute', 'Read'],
        'Read': ['Read'],
        'Write': ['Write'],
        'Delete': ['Delete']
    }

    # Check if the required action is allowed by the assigned permission
    if required_action in permission_hierarchy.get(assigned_permission, []):
        return True
    return False

def add_file_permissions(
    file_path: str,
    owner_id: int,
    parent_id: Optional[int] = None,
):
    
    connection = get_db_connection()
    cursor = connection.cursor()
    parent_id = get_parent_file(cursor, file_path)
    try:    

        cursor.execute(
            """
            INSERT INTO files (file_path, owner_id, parent_id)
            VALUES (?, ?, ?)
            """,
            (file_path, owner_id, parent_id),
        )
        file_id = cursor.lastrowid 

        default_group_ids = [1, 2, 3]  
        if parent_id:
            cursor.execute(
                """
                SELECT group_id
                FROM file_groups
                WHERE file_id = ?
                """,
                (parent_id,),
            )
            parent_groups = cursor.fetchall()

            if parent_groups:
                for group in parent_groups:
                    cursor.execute(
                        """
                        INSERT INTO file_groups (file_id, group_id)
                        VALUES (?, ?)
                        """,
                        (file_id, group["group_id"]),
                    )
            else:
                for group_id in default_group_ids:
                    cursor.execute(
                        """
                        INSERT INTO file_groups (file_id, group_id)
                        VALUES (?, ?)
                        """,
                        (file_id, group_id),
                    )
        else:
            for group_id in default_group_ids:
                cursor.execute(
                    """
                    INSERT INTO file_groups (file_id, group_id)
                    VALUES (?, ?)
                    """,
                    (file_id, group_id),
                )

        connection.commit()
    except Exception as e:
        connection.rollback();
        print(f"Error adding file permissions: {e}")
        raise   
    finally:
        connection.close()



