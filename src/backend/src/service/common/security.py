from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from pydantic import BaseModel
from passlib.context import CryptContext

# Use: $ openssl rand -hex 32
# to generate a secure random secret key

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "0a6c8420bba8707111d0270935f0dd58557b1fa178852d28a57aa93b877715e0"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 9999


class TokenData(BaseModel):
    username: str | None = None
    
def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt: str = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)