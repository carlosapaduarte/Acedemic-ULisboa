from typing import Union

from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from fastapi.responses import JSONResponse

from dtos.input_dtos import *
from exception import NotFoundException
import service

from fastapi.middleware.cors import CORSMiddleware

# Check this for erro handling: https://fastapi.tiangolo.com/tutorial/handling-errors/?h=error#import-httpexception

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(NotFoundException)
async def unicorn_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Not Found: {exc.user_id}"},
    )

@app.post("/login")
def login(input_dto: LoginInputDto) -> Response:
    service.login(input_dto.id)
    return Response() # Just for now...

@app.post("/set-level")
def set_level(input_dto: SetLevelInputDto):
    service.set_level(input_dto.id, input_dto.level)

@app.post("/set-publish-state-preference")
def set_share_progress_preference(input_dto: SetShareProgressPreferenceDto):
    service.set_share_progress_preference(input_dto.id, input_dto.shareProgress)

@app.post("/set-user-avatar")
def set_user_avatar(input_dto: SetUserAvatarDto):
    service.set_user_avatar(input_dto.id, input_dto.avatarFilename)

@app.get("/users/{user_id}")
def get_user_info(user_id: int):
    return service.get_user_info(user_id)

@app.post("/users/{user_id}/notes")
def create_user_note(user_id: int, input_dto: NewUserNoteDto):
    service.create_new_user_note(user_id, input_dto.name, input_dto.date)

@app.post("/users/{user_id}/completed-goals")
def add_completed_goal(user_id: int, input_dto: GoalCompletedDto) -> Response:
    service.add_completed_goal(user_id, input_dto.goalName, input_dto.date)
    return Response()