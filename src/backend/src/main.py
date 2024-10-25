
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from exception import NotFoundException, NotAvailableScheduleBlockCollision, UsernameAlreadyExistsException
from router.academic_challenge import academic_challenge
from router.commons import common

from fastapi.middleware.cors import CORSMiddleware

from router.study_tracker import study_tracker


# Check this for error handling: https://fastapi.tiangolo.com/tutorial/handling-errors/?h=error#import-httpexception

app = FastAPI()

app.include_router(common.router)
app.include_router(academic_challenge.router)
app.include_router(study_tracker.router)

origins = [
    "*" # [DEVELOPMENT ONLY]
    "https://acedemic.studentlife.ulisboa.pt",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5173",
    "http://localhost:5273",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(
        status_code=404,
        content={"error": f"Not Found: {exc.user_id}"},
    )
    
@app.exception_handler(UsernameAlreadyExistsException)
async def username_already_exists_exception_handler(request: Request, exc: UsernameAlreadyExistsException):
    return JSONResponse(
        status_code=409,
        content={"error": f"Username already taken!"},
    )

@app.exception_handler(NotAvailableScheduleBlockCollision)
async def not_available_schedule_block_collision_exception_handler(request: Request, exc: NotAvailableScheduleBlockCollision):
    return JSONResponse(
        status_code=409, # Conflict
        content={"error": "Event collides with an existent not-available schedule block"},
    )