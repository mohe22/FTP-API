import os
from datetime import datetime
from pathlib import Path
from config import Config
from utils.utils import get_db_connection


def get_directory_size(directory):
    total_size = 0
    for dirpath, _, filenames in os.walk(directory):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            if os.path.exists(fp):
                total_size += os.stat(fp).st_size
    return total_size

def format_time(timestamp):
    return datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")

def format_size(size):
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.2f} KB"
    elif size < 1024 * 1024 * 1024:
        return f"{size / (1024 * 1024):.2f} MB"
    else:
        return f"{size / (1024 * 1024 * 1024):.2f} GB"


def get_file_details(file_path: str):
    if not os.path.exists(file_path):
        return False
    details = {}

    if os.path.isfile(file_path):
        details["type"] = "File"
        details["size"] = format_size(os.path.getsize(file_path))
        details["extension"] = Path(file_path).suffix.lower()
    elif os.path.isdir(file_path):
        details["type"] = "Folder"
        details["size"] = format_size(get_directory_size(file_path))
        files, folders = 0, 0
        for _, dirnames, filenames in os.walk(file_path):
            folders += len(dirnames)
            files += len(filenames)
        details["contents"] = {"files": files, "folders": folders}
    details["name"] = Path(file_path).name
    details["last_scan"] = "Not implemented"
    details["scan_status"] = "Not implemented"
    details["full_path"] = os.path.abspath(file_path)
    details["last_modified"] = format_time(os.path.getmtime(file_path))
    details["created"] = format_time(os.path.getctime(file_path)) if os.name == "nt" else "N/A"
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT id,owner_id  FROM files WHERE file_path = ?", (file_path,))
        file_row = cursor.fetchone()

        if file_row is None:
            details["groups"] = []
        else:
            file_id = file_row["id"]
            cursor.execute("SELECT username FROM users WHERE id = ?", (file_row["owner_id"],))
            owner_row = cursor.fetchone()
            details["owner_name"] = owner_row["username"] if owner_row else "Unknown"

            cursor.execute("""
                SELECT g.id, g.group_name, gp.permission
                FROM file_groups fg
                JOIN groups g ON fg.group_id = g.id
                LEFT JOIN group_permissions gp ON g.id = gp.group_id
                WHERE fg.file_id = ?
            """, (file_id,))
            data = cursor.fetchall()

            # Define a mapping of permission strings to boolean keys
            permission_mapping = {
                "Read": "read",
                "Write": "write",
                "Read & Execute": "execute",
                "Delete": "delete",
                "Full Control": "full_control",
                "Modify":"Modify"
            }

            grouped_permissions = {}
            for row in data:
                group_id = row["id"]
                group_name = row["group_name"]
                permission = row["permission"]

                if group_id not in grouped_permissions:
                    grouped_permissions[group_id] = {
                        "id": group_id,
                        "group_name": group_name,
                        "permissions": {
                            "read": False,
                            "write": False,
                            "execute": False,
                            "delete": False,
                            "full_control": False,
                            "Modify":False,
                        }
                    }

                # Map the permission string to the corresponding boolean key
                if permission in permission_mapping:
                    permission_key = permission_mapping[permission]
                    grouped_permissions[group_id]["permissions"][permission_key] = True

            # Convert the dictionary to a list
            permissions = list(grouped_permissions.values())
            details["groups"] = permissions
    except Exception as e:
        print(f"Error getting file details: {e}")
     
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

    return details

def list_files(directory):
    try:
        if directory.startswith("/"):
            directory = directory[1:]
        if not os.path.exists(directory):
            return f"Error: Directory '{directory}' does not exist."
        
        files = os.listdir(directory)
        file_list = []

        for file in files:
            file_path = os.path.join(directory, file)
            file_stat = os.stat(file_path)

            nlinks = file_stat.st_nlink
            owner = file_stat.st_uid
            group = file_stat.st_gid

            if os.path.isdir(file_path):
                size = format_size(get_directory_size(file_path))
                is_folder = True
            else:
                size = format_size(file_stat.st_size)
                is_folder = False

            mtime = format_time(file_stat.st_mtime)

            # Include is_folder in the file_info string
            file_info = f"{nlinks}\t{owner}\t{group}\t{size}\t{mtime}\t{file}\t{is_folder}"
            file_list.append(file_info)

        file_list_str = "\r\n".join(file_list) + "\r\n"
        return file_list_str
    except Exception as e:
        return f"Error: {str(e)}"
    
def create_directory(new_dir, username=None):
    try:
        os.mkdir(new_dir)
        response = f"257 Directory created: {new_dir}\r\n"
        log_message = f"User {username} created directory {new_dir}"
        return response, log_message
    except FileExistsError:
        response = f"550 Directory already exists\r\n"
        log_message = (
            f"User {username} failed to create directory {new_dir} (already exists)"
        )
        return response, log_message
    except PermissionError:
        response = "550 Permission denied: Cannot create directory.\r\n"
        log_message = (
            f"User {username} failed to create directory {new_dir} (permission denied)"
        )
        return response, log_message
    except Exception as e:
        response = "550 Failed to create directory.\r\n"
        log_message = (
            f"User {username} failed to create directory {new_dir} (error: {e})"
        )
        return response, log_message


def delete_folder(dir_name):
    try:
        os.rmdir(dir_name)
        response = f"257 Directory deleted: {dir_name}\r\n"
        log_message = f"Directory deleted: {dir_name}"
        return response, log_message
    except OSError as e:
        if "The directory is not empty" in str(e):
            response = f"550 Directory not empty: {dir_name}\r\n"
            log_message = f"Failed to delete directory {dir_name} (directory not empty)"
        elif "Permission denied" in str(e):
            response = "550 Permission denied: Cannot delete directory.\r\n"
            log_message = f"Failed to delete directory {dir_name} (permission denied)"
        elif "The system cannot find the file specified" in str(e):
            response = f"550 Directory not found: {dir_name}\r\n"
            log_message = f"Failed to delete directory {dir_name} (directory not found)"
        else:
            response = "550 Failed to delete directory.\r\n"
            log_message = f"Failed to delete directory {dir_name} (error: {e})"
        return response, log_message
    except Exception as e:
        response = "550 Failed to delete directory.\r\n"
        log_message = f"Failed to delete directory {dir_name} (error: {e})"
        return response, log_message




def delete_recursive(path):

    try:
        if os.path.isdir(path):
            for item in os.listdir(path):
                item_path = os.path.join(path, item)
                delete_recursive(item_path)
            os.rmdir(path)
        else:
            os.remove(path)
        response = f"257 Directory deleted: {path}\r\n"
        log_message = f"Deleted: {path}"
        return response, log_message
    except Exception as e:
        response = "550 Failed to delete directory.\r\n"
        log_message = f"Failed to delete {path}: {e}"
        return response, log_message



def validate_and_join_path(directory = Config.SHARED_FOLDER, root_dir=Config.SHARED_FOLDER) :
    directory = directory if directory else Config.SHARED_FOLDER 

      # Normalize the path (remove redundant separators, resolve relative paths)
    normalized_directory = os.path.normpath(directory).replace("\\", "/")
    if normalized_directory.startswith("/"):
        normalized_directory = normalized_directory[1:]

    if ".." in normalized_directory.split("/"):
        return False
    
    
    abs_root = os.path.abspath(root_dir)
    abs_path = os.path.abspath(os.path.join(abs_root, normalized_directory))
    
    if not abs_path.startswith(abs_root):
        return False

    return abs_path