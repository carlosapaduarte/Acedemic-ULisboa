
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from exception import AlreadyExistsException, InvalidDate, NotFoundException, NotAvailableScheduleBlockCollision, UsernameAlreadyExistsException
from router import u_lisboa_auth
from router.academic_challenge import academic_challenge
from router.commons import common

from fastapi.middleware.cors import CORSMiddleware

from router.study_tracker import study_tracker


# Check this for error handling: https://fastapi.tiangolo.com/tutorial/handling-errors/?h=error#import-httpexception

app = FastAPI()

app.include_router(common.router)
app.include_router(academic_challenge.router)
app.include_router(study_tracker.router)
app.include_router(u_lisboa_auth.router)

dev_mode = True

origins = ["*"] if dev_mode else [
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
    
@app.exception_handler(AlreadyExistsException)
async def already_exists_exception_handler(request: Request, exc: AlreadyExistsException):
    return JSONResponse(
        status_code=409, # Conflict
        content={"error": "Resource already exists"},
    )
    
@app.exception_handler(InvalidDate)
async def invalid_date_exception_handler(request: Request, exc: InvalidDate):
    return JSONResponse(
        status_code=400, # Conflict
        content={"error": "Date is invalid"},
    )