from pydantic import BaseModel

class LoginInputDto(BaseModel):
    username: str
    password: str
    
class CreateUserInputDto(BaseModel):
    username: str
    password: str

class SetUserAvatarDto(BaseModel):
    avatarFilename: str

