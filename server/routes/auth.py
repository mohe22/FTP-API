from fastapi import APIRouter, HTTPException, status, Response, Request
from pydantic import BaseModel
import bcrypt
from datetime import datetime
from utils.utils import get_db_connection, add_activity
from utils.jwt import generate_jwt, decode_and_validate_token
import time
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config
import smtplib

router = APIRouter()
otp_store = {}
MAX_RETRIES = 3

class VerifyOTP(BaseModel):
    username: str
    otp: str

class LoginRequest(BaseModel):
    username: str
    password: str

def generate_otp(digit: int = 6) -> str:
    if not isinstance(digit, int) or digit < 1:
        raise ValueError("The number of digits must be a positive integer.")
    upper_bound = 10 ** digit
    otp = str(secrets.randbelow(upper_bound)).zfill(digit)
    return otp

def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    try:
        msg = MIMEMultipart()
        msg["From"] = Config.SMTP_USERNAME
        msg["To"] = to_email
        msg["Subject"] = subject
        if is_html:
            msg.attach(MIMEText(body, "html"))
        else:
            msg.attach(MIMEText(body, "plain"))
        with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
            server.starttls()
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
            server.sendmail(Config.SMTP_USERNAME, to_email, msg.as_string())
        return {"message": "Email sent successfully!"}
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )

def validate_ip_restriction(user, request, cursor, connection):
    if user["ip_restriction"] == 1:
        allowed_ips = user["Allowed_ips"].split(",") if user["Allowed_ips"] else []
        if request.client.host not in allowed_ips:
            add_activity(
                cursor=cursor,
                activity_type="Security",
                details="User IP restricted",
                category="Authentication",
                request=request,
                user_id=user["id"]
            )
            connection.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your IP address is not allowed"
            )

def validate_password(username, password, user, cursor, connection, request):
    stored_hash = user["hash_password"]
    if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
        if username in otp_store:
            otp_store[username]["failed_attempts"] += 1
        else:
            otp_store[username] = {
                "failed_attempts": 1,
                "user_id": user["id"],
            }

        if otp_store[username]["failed_attempts"] >= user["max_logged_in"]:
            del otp_store[username]
            cursor.execute(
                "UPDATE users SET is_blocked = 1 WHERE id = ?",
                (user["id"],)
            )
            connection.commit()
        add_activity(
            cursor=cursor,
            activity_type="Security",
            details="Failed login attempt",
            category="Authentication",
            request=request,
            user_id=user["id"]
        )
        connection.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

def validate_account_block(user, cursor, connection, request):
    if user["is_blocked"] == 1:
        add_activity(
            cursor=cursor,
            activity_type="Security",
            details="Your account was blocked due to multiple failed login attempts",
            category="Authentication",
            request=request,
            user_id=user["id"]
        )
        connection.commit()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is blocked. Please contact the admin."
        )

def handle_two_factor_auth(user):
    if user["Two_factor_auth"] == 1:
        otp = generate_otp(6)
        expiration_time = time.time() + 60
        otp_store[user["username"]] = {
            "otp": otp,
            "expires_at": expiration_time,
            "user_id": user["id"],
            "retry_count": 0
        }
        send_email(
            to_email=user["email"],
            subject="Your OTP Code",
            body=f"Your OTP code is {otp}"
        )
        return HTTPException(status_code=status.HTTP_307_TEMPORARY_REDIRECT, detail="OTP sent")

def collect_group_info(rows):
    group_info = []
    for row in rows:
        if row["group_id"]:
            group_info.append({
                "group_id": row["group_id"],
                "group_name": row["group_name"]
            })
    return group_info

def generate_user_data(user, group_info):
    return {
        "username": user["username"],
        "id": user["id"],
        "group_info": group_info,
        "is_admin": user["is_admin"] == 1,
        "retry_count": 0,
    }

def update_user_activity(cursor, user_id):
    cursor.execute(
        "UPDATE users SET last_activity = ? WHERE id = ?",
        (datetime.utcnow(), user_id)
    )



@router.post("/login", status_code=status.HTTP_200_OK)
async def login(request: Request, user_data: LoginRequest, response: Response):
    username = user_data.username
    password = user_data.password

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT 
                u.id, u.hash_password, u.username, u.is_admin, 
                u.max_logged_in, u.session_time_out, u.Two_factor_auth, 
                u.ip_restriction, u.Allowed_ips, u.is_blocked, u.email,
                g.id AS group_id, g.group_name
            FROM users u
            LEFT JOIN user_groups ug ON u.id = ug.user_id
            LEFT JOIN groups g ON ug.group_id = g.id
            WHERE u.username = ?
            """,
            (username,)
        )
        rows = cursor.fetchall()

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = rows[0]
        validate_ip_restriction(user, request, cursor, connection)
        validate_account_block(user, cursor, connection, request)
        validate_password(username, password, user, cursor, connection, request)
        two_factor_response = handle_two_factor_auth(user)
        if two_factor_response:
            return two_factor_response

        group_info = collect_group_info(rows)
        user_data = generate_user_data(user, group_info)
        jwt_token = generate_jwt(user_data, user["session_time_out"])
        update_user_activity(cursor, user["id"])
        add_activity(
            cursor=cursor,
            activity_type="Security",
            details="User logged in",
            category="Authentication",
            request=request,
            user_id=user["id"]
        )
        connection.commit()
        response.set_cookie(
            key="token",
            value=jwt_token,
            max_age=user["session_time_out"] * 60,
            httponly=True,
            secure=False,  
            samesite="strict", 
            path="/",  
        )
        return {
            "message": "Login successful",
            "token": jwt_token,
            "user_data": user_data
        }

    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error"
        )
    finally:
        cursor.close()
        connection.close()


@router.post("/verify-otp", status_code=status.HTTP_200_OK)
async def verify_otp(request: Request, otp_data: VerifyOTP, response: Response):
    username = otp_data.username
    otp = otp_data.otp

    if username not in otp_store:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP not found or expired"
        )

    stored_otp = otp_store[username]["otp"]
    expires_at = otp_store[username]["expires_at"]

    if time.time() > expires_at:
        del otp_store[username]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired"
        )

    if "retry_count" in otp_store[username] and otp_store[username]["retry_count"] >= MAX_RETRIES:
        del otp_store[username]
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please request a new OTP."
        )

    if otp != stored_otp:
        otp_store[username]["retry_count"] += 1
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP. You have {MAX_RETRIES - otp_store[username]['retry_count']} attempts remaining."
        )

    # Fetch user data after OTP verification
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT 
                u.id, u.hash_password, u.username, u.is_admin, 
                u.max_logged_in, u.session_time_out, u.Two_factor_auth, 
                u.ip_restriction, u.Allowed_ips, u.is_blocked, u.email,
                g.id AS group_id, g.group_name
            FROM users u
            LEFT JOIN user_groups ug ON u.id = ug.user_id
            LEFT JOIN groups g ON ug.group_id = g.id
            WHERE u.username = ?
            """,
            (username,)
        )
        rows = cursor.fetchall()

        if not rows:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        user = rows[0]
        group_info = collect_group_info(rows)
        user_data = generate_user_data(user, group_info)
        jwt_token = generate_jwt(user_data, user["session_time_out"])
        update_user_activity(cursor, user["id"])
        add_activity(
            cursor=cursor,
            activity_type="Security",
            details="User logged in via OTP",
            category="Authentication",
            request=request,
            user_id=user["id"]
        )
        connection.commit()

        # Set the JWT token in the response cookie
        response.set_cookie(
            key="token",
            value=jwt_token,
            max_age=user["session_time_out"] * 60,
            httponly=True,
            secure=False,  
            samesite="strict", 
            path="/",  
        )

        return {
            "message": "OTP verification successful",
            "token": jwt_token,
            "user_data": user_data
        }

    except HTTPException:
        raise
    except Exception as e:
        connection.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error"
        )
    finally:
        cursor.close()
        connection.close()


@router.get("/validate-token")
async def validate_token(request: Request):
    token = request.cookies.get("token")
    print("token",token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not found"
        )
    payload = decode_and_validate_token(token)
    return {
        "status": "success",
        "message": "Token is valid",
        "user_data": payload
    }