from datetime import datetime
from fastapi import APIRouter, Response
from domain.study_tracker import Event, EventDate, Task, UnavailableScheduleBlock
from router.study_tracker.dtos.input_dtos import CreateTaskInputDto, CreateEventInputDto, CreateScheduleNotAvailableBlock, SetStudyTrackerAppUseGoalsInputDto, UpdateStudyTrackerReceiveNotificationsPrefInputDto, UpdateStudyTrackerWeekPlanningDayInputDto, UpdateTaskStatus
from router.study_tracker.dtos.output_dtos import TaskCreatedOutputDto, UserTaskOutputDto
from service import study_tracker as study_tracker_service


router = APIRouter(
    prefix="/study-tracker",
)

@router.post("/users/{user_id}/events")
def create_event(user_id: int, dto: CreateEventInputDto) -> Response:
    study_tracker_service.create_event(
        user_id, 
        Event(
            title=dto.title,
            date=EventDate(
                    start_date=datetime.fromtimestamp(dto.startDate),
                    end_date=datetime.fromtimestamp(dto.endDate)
                ),
            tags=dto.tags
        )
    )
    return Response()
    
@router.put("/users/{user_id}/use-goals")
def update_app_use_goals(user_id: int, input_dto: SetStudyTrackerAppUseGoalsInputDto):
    study_tracker_service.update_user_study_tracker_use_goals(user_id, input_dto.uses)

@router.put("/users/{user_id}/receive-notifications-pref")
def update_receive_notifications_pref(user_id: int, input_dto: UpdateStudyTrackerReceiveNotificationsPrefInputDto):
    study_tracker_service.update_receive_notifications_pref(user_id, input_dto.receive)

@router.put("/users/{user_id}/week-planning-day")
def update_week_planning_day(user_id: int, input_dto: UpdateStudyTrackerWeekPlanningDayInputDto):
    study_tracker_service.update_study_tracker_app_planning_day(user_id, input_dto.day, input_dto.hour)

@router.get("/users/{user_id}/events")
def get_events(user_id: int, today: bool):
    # PROBLEM: it's returning with date one hour different

    #print(datetime.fromtimestamp(service.get_user_info(user_id).batches[0].startDate))
    if today:
        return study_tracker_service.get_today_events(user_id)
    else:
        return study_tracker_service.get_events(user_id)
    
def fix_weekday_from_javascript(weekday: int) -> int:
    # Temporary solution to convert javascript Date().getDay() into python datetime.date().weekday
    # A better solution should be fixing this in the frontend!
    
    if weekday == 0:
        return 6
    return weekday - 1
    
@router.post("/users/{user_id}/schedule/unavailable")
def create_schedule_not_available_block(user_id: int, dto: CreateScheduleNotAvailableBlock) -> Response:
    study_tracker_service.create_schedule_not_available_block(
        user_id, 
        UnavailableScheduleBlock(
            week_day=fix_weekday_from_javascript(dto.weekDay),
            start_hour=dto.startHour,
            duration=dto.duration
        )
    )
    return Response()

@router.get("/users/{user_id}/tasks")
def get_tasks(user_id: int, order_by_deadline_and_priority: bool) -> list[UserTaskOutputDto]:
    tasks: list[Task] = study_tracker_service.get_user_tasks(user_id, order_by_deadline_and_priority)
    return UserTaskOutputDto.from_Tasks(tasks)

@router.post("/users/{user_id}/tasks")
def create_task(user_id: int, dto: CreateTaskInputDto) -> TaskCreatedOutputDto:
    task_id = study_tracker_service.create_task(user_id, Task.fromCreateTaskInputDto(dto), dto.createEvent)
    return TaskCreatedOutputDto(task_id=task_id)

@router.put("/users/{user_id}/tasks/{task_id}")
def update_task_status(user_id: int, task_id: int, dto: UpdateTaskStatus) -> Response:
    study_tracker_service.update_task_status(user_id, task_id, dto.new_status)