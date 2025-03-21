import sqlite3
from datetime import datetime
import bcrypt
from typing import Optional
from config import Config
from typing import Optional
from fastapi import Request
from user_agents import parse

DATABASE_FILE = "my_database.db"

def get_db_connection():
    """Create a new database connection."""
    connection = sqlite3.connect(DATABASE_FILE)
    connection.row_factory = sqlite3.Row
    return connection

def initialize_database():
    """Initialize the database with the required tables."""
    connection = get_db_connection()
    cursor = connection.cursor()
           
    # fix,Tow_factor_auth BOOLEAN DEFAULT 0, to Two.
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            is_admin BOOLEAN DEFAULT 0,
            username VARCHAR(255) UNIQUE NOT NULL,
            hash_password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            email VARCHAR(255) UNIQUE,
            location VARCHAR(255),
            phone VARCHAR(255),
            bio TEXT,
            status VARCHAR(50) DEFAULT 'active',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_activity TIMESTAMP,
            avatar VARCHAR(255),
            max_logged_in INTEGER DEFAULT 5,
            session_time_out INTEGER DEFAULT 30,
            password_expiry_date INTEGER DEFAULT 90,
            Two_factor_auth BOOLEAN DEFAULT 0,
            ip_restriction BOOLEAN DEFAULT 0,
            Allowed_ips TEXT,
            is_blocked BOOLEAN DEFAULT 0
        );
        """
    )

    cursor.execute(
        """
       CREATE TABLE IF NOT EXISTS activity (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_type VARCHAR(50) NOT NULL,
                activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                details TEXT NOT NULL,
                category VARCHAR(50) NOT NULL,
                endpoint VARCHAR(255), 
                http_method VARCHAR(10),
                ip_address VARCHAR(50),
                Browser VARCHAR(255),
                OS VARCHAR(255),
                user_id INTEGER,
                changed_by INTEGER,
                FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        """
    )

    # Create Groups Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        	Description TEXT
        );
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS file_groups (
            file_id INTEGER NOT NULL,
            group_id INTEGER NOT NULL,
            PRIMARY KEY (file_id, group_id),
            FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );
        """
    )
    # Create Files Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_path VARCHAR(1024) UNIQUE NOT NULL,
            owner_id INTEGER NOT NULL,
            parent_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES files(id) ON DELETE CASCADE

        );
        """
    )

    # Create Group Permissions Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS group_permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            
            permission VARCHAR(50) NOT NULL CHECK (permission IN (
                'Full Control', 'Modify', 'Read & Execute', 'Read', 'Write','Delete'
            )),
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );
        """
    )

    # Create User Groups Table
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS user_groups (
            user_id INTEGER,
            group_id INTEGER,
            PRIMARY KEY (user_id, group_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
        );
        """
    )

    connection.commit()
    cursor.close()
    connection.close()



def add_default_data():
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Add default users
        default_users = [
            (1, 1, "admin", bcrypt.hashpw("admin123".encode("utf-8"), bcrypt.gensalt()) ),
            (2, 0, "user1", bcrypt.hashpw("user1123".encode("utf-8"), bcrypt.gensalt())),
            (3, 0, "user2", bcrypt.hashpw("user2123".encode("utf-8"), bcrypt.gensalt()))
        ]
        cursor.executemany(
            "INSERT INTO users (id, is_admin, username, hash_password) VALUES (?, ?, ?, ?)",
            default_users
        )

        # Add default groups
        default_groups = [
            (1, "Administrators"),
            (2, "Users"),
            (3, "Guests")
        ]
        cursor.executemany(
            "INSERT INTO groups (id, group_name) VALUES (?, ?)",
            default_groups
        )

        # Assign users to groups
        user_groups = [
            (1, 1),  # admin -> Administrators
            (2, 2),  # user1 -> Users
            (3, 2),  # user2 -> Users
            (1, 2)   # admin -> Users (example of user in multiple groups)
        ]
        cursor.executemany(
            "INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)",
            user_groups
        )

        # Add default group permissions
        group_permissions = [
            (1, 'Full Control'),  # Administrators group
            (2, 'Modify'),        # Users group
            (3, 'Read')           # Guests group
        ]
        cursor.executemany(
            "INSERT INTO group_permissions (group_id, permission) VALUES (?, ?)",
            group_permissions
        )

   
        cursor.execute(
            "INSERT OR IGNORE INTO files (file_path, owner_id, parent_id) VALUES (?, ?,?)",
            (Config.SHARED_FOLDER, 1,1)
        )
        # Get the file ID for the shared file
        cursor.execute("SELECT id FROM files WHERE file_path = ?", (Config.SHARED_FOLDER,))
        file_id = cursor.fetchone()
        
        if file_id:
            file_id = file_id[0]
            cursor.executemany(
                "INSERT OR IGNORE INTO file_groups (file_id, group_id) VALUES (?, ?)",
                [(file_id, 1), (file_id, 2), (file_id, 3)]  
            )

        connection.commit()
        print("Default data added successfully.")
    except sqlite3.IntegrityError as e:
        print(f"Integrity Error: {e}")
    except Exception as e:
        print(f"Error adding default data: {e}")
    finally:
        cursor.close()
        connection.close()
        







def add_activity(
    cursor,
    activity_type: str,
    details: str,
    category: str,
    changed_by: Optional[int] = None,
    user_id: Optional[int] = None,
    request: Optional[Request] = None,
):
    
    try:
        if not activity_type or not details or not category:
            raise ValueError("activity_type, details, and category are required.")

        # Extract data from the request
        ip_address = None
        browser = None
        os = None
        http_method = None
        endpoint = None

        if request:
            ip_address = request.client.host if request.client else None
            user_agent_header = request.headers.get("user-agent", "Unknown")
            user_agent = parse(user_agent_header)
            browser = user_agent.browser.family
            os = user_agent.os.family
            http_method = request.method
            endpoint = request.url.path

        # Insert activity into the database
        cursor.execute(
            """
            INSERT INTO activity (
                activity_type, details, category, ip_address, user_id, changed_by,
                Browser, OS, http_method, endpoint
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                activity_type, details, category, ip_address, user_id, changed_by,
                browser, os, http_method, endpoint
            ),
        )
        print("Activity logged successfully.")
    except Exception as e:
        print(f"Error logging activity: {e}")
        raise