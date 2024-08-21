from typing import Union

from fastapi import Depends, FastAPI, Request, Response
from pydantic import BaseModel
from fastapi.responses import JSONResponse

from dtos.input_dtos import *
from exception import NotFoundException
import service
from datetime import datetime, timezone

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

@app.post("/users/{user_id}/batches")
def create_batch(user_id: int, input_dto: CreateBatchInputDto):
    return service.create_batch(user_id, input_dto.level)

@app.put("/users/{user_id}/publish-state")
def set_share_progress_preference(user_id: int, input_dto: SetShareProgressPreferenceDto):
    service.set_share_progress_preference(user_id, input_dto.shareProgress)

@app.put("/users/{user_id}/avatar")
def set_user_avatar(user_id: int, input_dto: SetUserAvatarDto):
    service.set_user_avatar(user_id, input_dto.avatarFilename)

@app.get("/users/{user_id}")
def get_user_info(user_id: int):
    #print(datetime.fromtimestamp(service.get_user_info(user_id).batches[0].startDate))
    return service.get_user_info(user_id)

@app.post("/users/{user_id}/notes")
def create_user_note(user_id: int, input_dto: NewUserNoteDto):
    service.create_new_user_note(user_id, input_dto.text, datetime.fromtimestamp(input_dto.date))

@app.post("/users/{user_id}/batches/{batch_id}/completed-goals")
def add_completed_goal(user_id: int, batch_id: int, input_dto: GoalCompletedDto) -> Response:
    service.create_completed_goal(
        user_id, 
        batch_id, 
        input_dto.goalName,
        input_dto.goalDay, 
        datetime.now()
    )
    return Response()