from pydantic import BaseModel

class LoginInputDto(BaseModel):
    id: int



class SetUserAvatarDto(BaseModel):
    avatarFilename: str

