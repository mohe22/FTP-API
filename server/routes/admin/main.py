import sqlite3
from fastapi import APIRouter, Depends, HTTPException, status, Request,Query
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import bcrypt
from utils.utils import get_db_connection,add_activity
from utils.jwt import get_current_user
from .users import router as users_router
from .groups import router as groups_router
from .activity import router as activity_router
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/ftp/admin", tags=["admin"])
router.include_router(users_router)
router.include_router(groups_router)
router.include_router(activity_router)

@router.get("/dashboard-stats")
def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view dashboard stats"
        )
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # 1. Total Users
        cursor.execute("SELECT COUNT(*) as total_users FROM users")
        total_users = cursor.fetchone()["total_users"]

        # 2. Active Users
        cursor.execute("SELECT COUNT(*) as active_users FROM users WHERE status = 'active'")
        active_users = cursor.fetchone()["active_users"]

        # 3. Inactive Users
        cursor.execute("SELECT COUNT(*) as inactive_users FROM users WHERE status = 'inactive'")
        inactive_users = cursor.fetchone()["inactive_users"]

        # 4. Recent Activity (last 7 days)
        seven_days_ago = datetime.now() - timedelta(days=7)
        cursor.execute(
            """
            SELECT activity.activity_type, activity.details, activity.activity_time, 
                   users.username, users.avatar
            FROM activity
            JOIN users ON activity.user_id = users.id
            WHERE activity_time >= ?
            ORDER BY activity_time DESC
            LIMIT 10
            """,
            (seven_days_ago,),
        )
        recent_activity = cursor.fetchall()

        # Convert recent activity to a list of dictionaries
        recent_activity_list = [
            {
                "activity_type": row["activity_type"],
                "details": row["details"],
                "activity_time": row["activity_time"],
                "username": row["username"],
                "avatar": row["avatar"],  # Include the avatar
            }
            for row in recent_activity
        ]

        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "recent_activity": recent_activity_list,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching dashboard stats: {e}")
    finally:
        cursor.close()
        connection.close()