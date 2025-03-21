from datetime import datetime, timedelta
from fastapi import HTTPException, Request, status
import jwt
from config import Config

jwt_expiry_minutes = 30

async def get_current_user(request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    try:
        payload = decode_and_validate_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token or missing user ID"
            )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    

def decode_and_validate_token(token: str):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def generate_jwt(
        user_data,jwt_expiry_minutes_=jwt_expiry_minutes):
    to_encode = {
        "username": user_data.get("username"),
        "user_id": user_data.get("id"),
        "group_info": user_data.get("group_info"), 
        "is_admin": user_data.get("is_admin", False),  
        "exp": datetime.utcnow() + timedelta(minutes=jwt_expiry_minutes_)  
    }
    return jwt.encode(to_encode, Config.SECRET_KEY, algorithm="HS256")