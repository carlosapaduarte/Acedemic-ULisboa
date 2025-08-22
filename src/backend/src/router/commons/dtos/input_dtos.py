from pydantic import BaseModel
from typing import Optional

class LoginInputDto(BaseModel):
    username: str
    password: str
    
class CreateUserInputDto(BaseModel):
    username: str
    password: str

class SetUserAvatarDto(BaseModel):
    avatarFilename: str