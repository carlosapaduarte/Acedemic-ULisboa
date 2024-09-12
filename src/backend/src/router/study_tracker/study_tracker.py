from datetime import datetime
from fastapi import APIRouter, Response
from domain.study_tracker import DateInterval, Event, Task, UnavailableScheduleBlock
from router.study_tracker.dtos.input_dtos import CreateArchiveInputDto, CreateFileInputDto, CreateTaskInputDto, CreateEventInputDto, CreateScheduleNotAvailableBlockInputDto, SetStudyTrackerAppUseGoalsInputDto, UpdateStudyTrackerReceiveNotificationsPrefInputDto, UpdateStudyTrackerWeekPlanningDayInputDto, UpdateTaskStatus
from router.study_tracker.dtos.output_dtos import ArchiveOutputDto, EventOutputDto, TaskCreatedOutputDto, UserTaskOutputDto
from service import study_tracker as study_tracker_service


router = APIRouter(
    prefix="/study-tracker",
)

@router.post("/users/{user_id}/tasks")
def create_task(user_id: int, dto: CreateTaskInputDto) -> TaskCreatedOutputDto:
    task_id = study_tracker_service.create_task(user_id, Task.fromCreateTaskInputDto(dto), dto.createEvent)
    return TaskCreatedOutputDto(task_id=task_id)

@router.get("/users/{user_id}/tasks")
def get_tasks(user_id: int, order_by_deadline_and_priority: bool) -> list[UserTaskOutputDto]:
    tasks: list[Task] = study_tracker_service.get_user_tasks(user_id, order_by_deadline_and_priority)
    return UserTaskOutputDto.from_Tasks(tasks)

@router.put("/users/{user_id}/tasks/{task_id}")
def update_task_status(user_id: int, task_id: int, dto: UpdateTaskStatus):
    study_tracker_service.update_task_status(user_id, task_id, dto.newStatus)

@router.get("/users/{user_id}/events")
def get_events(user_id: int, today: bool) -> list[EventOutputDto]:
    #print(datetime.fromtimestamp(service.get_user_info(user_id).batches[0].startDate))
    events: list[Event]
    if today:
        events = study_tracker_service.get_today_events(user_id)
    else:
        events = study_tracker_service.get_events(user_id)
    return EventOutputDto.from_events(events)

@router.post("/users/{user_id}/events")
def create_event(user_id: int, dto: CreateEventInputDto) -> Response:
    study_tracker_service.create_event(
        user_id, 
        Event(
            title=dto.title,
            date=DateInterval(
                    start_date=datetime.fromtimestamp(dto.startDate),
                    end_date=datetime.fromtimestamp(dto.endDate)
                ),
            tags=dto.tags,
            every_week=dto.everyWeek
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
    
def fix_weekday_from_javascript(weekday: int) -> int:
    # Temporary solution to convert javascript Date().getDay() into python datetime.date().weekday
    # A better solution should be fixing this in the frontend!
    
    if weekday == 0:
        return 6
    return weekday - 1
    
@router.post("/users/{user_id}/schedule/unavailable")
def create_schedule_not_available_block(user_id: int, dto: CreateScheduleNotAvailableBlockInputDto) -> Response:
    study_tracker_service.create_schedule_not_available_block(
        user_id, 
        UnavailableScheduleBlock(
            week_day=fix_weekday_from_javascript(dto.weekDay),
            start_hour=dto.startHour,
            duration=dto.duration
        )
    )
    return Response()

@router.post("/users/{user_id}/archives")
def create_archive(user_id: int, dto: CreateArchiveInputDto):
    study_tracker_service.create_archive(user_id, dto.name)
    
@router.get("/users/{user_id}/archives")
def get_events(user_id: int) ->  list[ArchiveOutputDto]:
    archives = study_tracker_service.get_archives(user_id)
    return ArchiveOutputDto.from_archives(archives)

@router.post("/users/{user_id}/archives/{archive_name}")
def create_file(user_id: int, archive_name: str, dto: CreateFileInputDto):
    study_tracker_service.create_file(user_id, archive_name, dto.name)