from fastapi import APIRouter, HTTPException, status, Query,Depends
from typing import List, Optional
import sqlite3
from utils.utils import get_db_connection
from utils.jwt import get_current_user

router = APIRouter(prefix="/activity", tags=["activity"])
@router.get("/get-activities", response_model=List[dict])
async def get_all_activities(
    skip: int = Query(0, description="Number of records to skip"),
    limit: int = Query(10, description="Number of records to return"),
    username: Optional[str] = Query(None, description="Filter by username"),
    details: Optional[str] = Query(None, description="Filter by details"),
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    date_from: Optional[str] = Query(None, description="Filter by start date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter by end date (YYYY-MM-DD)")
):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        query = """
            SELECT 
                a.id AS activity_id,
                a.activity_type,
                a.activity_time,
                a.details,
                a.category,
                a.endpoint,
                a.http_method,
                a.ip_address,
                a.Browser,
                a.OS,
                u.id AS user_id,
                u.username,
                u.avatar
            FROM activity a
            LEFT JOIN users u ON a.user_id = u.id
        """
        params = []

  

        # Add WHERE  only if at least one filter is provided
        if any([username, details, activity_type, date_from, date_to]):
            query += " WHERE 1=1"

            if username and username.strip():
                query += " AND TRIM(u.username) LIKE ?"
                params.append(f"%{username.strip()}%")
            if details and details.strip():
                query += " OR TRIM(a.details) LIKE ?"
                params.append(f"%{details.strip()}%")
            if activity_type and activity_type.strip():
                query += " OR a.category = ?"
                params.append(activity_type.strip())
            if date_from:
                query += " AND a.activity_time >= ?"
                params.append(date_from)
            if date_to:
                query += " AND a.activity_time <= ?"
                params.append(date_to)

        query += " ORDER BY a.activity_time DESC LIMIT ? OFFSET ?"
        params.extend([limit, skip])


        cursor.execute(query, params)
        activities = cursor.fetchall()
    
        return [dict(activity) for activity in activities]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching activities: {str(e)}"
        )

    finally:
        cursor.close()
        connection.close()


@router.delete("/delete-activity/{activity_id}")
async def delete_activity(activity_id: int,    current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM activity WHERE id = ?", (activity_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Activity not found")
        connection.commit()
        return {"message": "Activity deleted successfully"}
    except sqlite3.Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        connection.close()

@router.delete("/delete-all-activities")
async def delete_all_activities(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
    )
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM activity")
        connection.commit()
        return {"message": f"Deleted {cursor.rowcount} activities successfully"}
    except sqlite3.Error as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        cursor.close()
        connection.close()