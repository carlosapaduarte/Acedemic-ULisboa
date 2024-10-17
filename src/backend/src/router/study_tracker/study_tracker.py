from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, Depends, Response
from domain.study_tracker import DailyEnergyStatus, DateInterval, Event, Grade, SlotToWork, Task, UnavailableScheduleBlock, WeekAndYear
from router.commons.common import get_current_user_id
from router.study_tracker.dtos.input_dtos import CreateArchiveInputDto, CreateCurricularUnitInputDto, CreateDailyEnergyStatus, CreateFileInputDto, CreateGradeInputDto, CreateTaskInputDto, CreateEventInputDto, CreateScheduleNotAvailableBlockInputDto, SetStudyTrackerAppUseGoalsInputDto, UpdateFileInputDto, UpdateStudyTrackerReceiveNotificationsPrefInputDto, UpdateStudyTrackerWeekPlanningDayInputDto, UpdateTaskStatus, UpdateWeekStudyTime
from router.study_tracker.dtos.output_dtos import ArchiveOutputDto, CurricularUnitOutputDto, DailyEnergyStatusOutputDto, DailyTasksProgress, EventOutputDto, UserTaskOutputDto, WeekTimeStudyOutputDto
from service import study_tracker as study_tracker_service


router = APIRouter(
    prefix="/study-tracker",
)

@router.post("/users/me/tasks")
def create_task(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateTaskInputDto
) -> UserTaskOutputDto:
    slots_to_work = []
    if dto.slotsToWork is not None:
        slots_to_work = dto.slotsToWork
    
    # This route returns the newly created task!
    task_id = study_tracker_service.create_task(
        user_id, 
        Task.from_create_task_input_dto(dto), 
        SlotToWork.from_slot_to_work_input_dto(slots_to_work)
    )
    task = study_tracker_service.get_user_task(user_id, task_id)
    return UserTaskOutputDto.from_Task(task)

@router.get("/users/me/tasks")
def get_tasks(
    user_id: Annotated[int, Depends(get_current_user_id)],
    orderByDeadlineAndPriority: bool,
    filterUncompletedTasks: bool
) -> list[UserTaskOutputDto]:
    tasks = study_tracker_service.get_user_tasks(user_id, orderByDeadlineAndPriority, filterUncompletedTasks, False)
    return UserTaskOutputDto.from_Tasks(tasks)

@router.get("/users/me/statistics/daily-tasks-progress")
def get_daily_tasks_progress(
    user_id: Annotated[int, Depends(get_current_user_id)],
) -> DailyTasksProgress:
    progress = study_tracker_service.get_user_daily_tasks_progress(user_id)
    return DailyTasksProgress(progress=progress)

@router.put("/users/me/tasks/{task_id}")
def update_task_status(
    user_id: Annotated[int, Depends(get_current_user_id)],
    task_id: int,
    dto: UpdateTaskStatus
):
    study_tracker_service.update_task_status(user_id, task_id, dto.newStatus)

@router.get("/users/me/events")
def get_events(
    user_id: Annotated[int, Depends(get_current_user_id)],
    today: bool,
    recurrentEvents: bool,
) -> list[EventOutputDto]:
    #print(datetime.fromtimestamp(service.get_user_info(user_id).batches[0].startDate))
    events = study_tracker_service.get_events(user_id, today, recurrentEvents, False)
    return EventOutputDto.from_events(events)

@router.post("/users/me/events")
def create_event(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateEventInputDto
) -> Response:
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

@router.put("/users/me/events/{event_id}")
def update_event(
    user_id: Annotated[int, Depends(get_current_user_id)],
    event_id: int,
    dto: CreateEventInputDto
) -> Response:
    study_tracker_service.update_event(
        user_id,
        event_id,
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

@router.delete("/users/me/events/{event_id}")
def delete_event(
    user_id: Annotated[int, Depends(get_current_user_id)],
    event_id: int,
) -> Response:
    study_tracker_service.delete_event(user_id, event_id)
    return Response()
    
@router.put("/users/me/use-goals")
def update_app_use_goals(
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: SetStudyTrackerAppUseGoalsInputDto
):
    study_tracker_service.update_user_study_tracker_use_goals(user_id, input_dto.uses)

@router.put("/users/me/receive-notifications-pref")
def update_receive_notifications_pref(
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: UpdateStudyTrackerReceiveNotificationsPrefInputDto
):
    study_tracker_service.update_receive_notifications_pref(user_id, input_dto.receive)

@router.put("/users/me/week-planning-day")
def update_week_planning_day(
    user_id: Annotated[int, Depends(get_current_user_id)],
    input_dto: UpdateStudyTrackerWeekPlanningDayInputDto
):
    study_tracker_service.update_study_tracker_app_planning_day(user_id, input_dto.day, input_dto.hour)
    
def fix_weekday_from_javascript(weekday: int) -> int:
    # Temporary solution to convert javascript Date().getDay() into python datetime.date().weekday
    # A better solution should be fixing this in the frontend!
    
    if weekday == 0:
        return 6
    return weekday - 1
    
@router.post("/users/me/schedule/unavailable")
def create_schedule_not_available_block(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateScheduleNotAvailableBlockInputDto
) -> Response:
    study_tracker_service.create_schedule_not_available_block(
        user_id, 
        UnavailableScheduleBlock(
            week_day=fix_weekday_from_javascript(dto.weekDay),
            start_hour=dto.startHour,
            duration=dto.duration
        )
    )
    return Response()

@router.post("/users/me/archives")
def create_archive(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateArchiveInputDto
):
    study_tracker_service.create_archive(user_id, dto.name)
    
@router.get("/users/me/archives")
def get_archives(
    user_id: Annotated[int, Depends(get_current_user_id)]
) ->  list[ArchiveOutputDto]:
    archives = study_tracker_service.get_archives(user_id)
    return ArchiveOutputDto.from_archives(archives)

@router.post("/users/me/archives/{archive_name}")
def create_file(
    user_id: Annotated[int, Depends(get_current_user_id)],
    archive_name: str,
    dto: CreateFileInputDto
):
    study_tracker_service.create_file(user_id, archive_name, dto.name)
    
@router.put("/users/me/archives/{archive_name}/files/{filename}")
def update_file_content(
    user_id: Annotated[int, Depends(get_current_user_id)],
    archive_name: str,
    filename: str,
    dto: UpdateFileInputDto
):
    study_tracker_service.update_file_content(user_id, archive_name, filename, dto.content)
    
@router.get("/users/me/curricular-units")
def get_curricular_units(
    user_id: Annotated[int, Depends(get_current_user_id)]
) ->  list[CurricularUnitOutputDto]:
    curricular_units = study_tracker_service.get_curricular_units(user_id)
    return CurricularUnitOutputDto.from_curricular_units(curricular_units)

@router.post("/users/me/curricular-units")
def create_curricular_unit(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateCurricularUnitInputDto
):
    study_tracker_service.create_curricular_unit(user_id, dto.name)
    
@router.post("/users/me/curricular-units/{curricular_unit}/grades")
def create_grade(
    user_id: Annotated[int, Depends(get_current_user_id)],
    curricular_unit: str,
    dto: CreateGradeInputDto
):
    study_tracker_service.create_grade(user_id, curricular_unit, Grade(
        value=dto.value,
        weight=dto.weight
    ))
    
@router.post("/users/me/statistics/daily-energy-status")
def create_daily_energy_stat(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateDailyEnergyStatus
):
    study_tracker_service.create_daily_energy_status(
        user_id, 
        DailyEnergyStatus(
            datetime.fromtimestamp(dto.date), 
            dto.level
        )
    )
    
@router.get("/users/me/statistics/daily-energy-status")
def get_daily_energy_history(
    user_id: Annotated[int, Depends(get_current_user_id)]
) ->  list[DailyEnergyStatusOutputDto]:
    history = study_tracker_service.get_daily_energy_history(user_id)
    return DailyEnergyStatusOutputDto.from_domain(history)


@router.get("/users/me/statistics/time-by-event-tag")
def get_task_time_distribution(
    user_id: Annotated[int, Depends(get_current_user_id)]
) ->  dict[int, dict[int, dict[str, int]]]:
    return study_tracker_service.get_task_time_distribution(user_id)

@router.get("/users/me/statistics/week-study-time")
def get_study_time_by_week(
    user_id: Annotated[int, Depends(get_current_user_id)]
) ->  list[WeekTimeStudyOutputDto]:
    stats_by_week = study_tracker_service.get_total_time_study_per_week(user_id)
    return WeekTimeStudyOutputDto.from_domain(stats_by_week)

@router.put("/users/me/statistics/week-study-time/total")
def increment_week_study_time(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: UpdateWeekStudyTime
):
    study_tracker_service.increment_week_study_time(
        user_id, 
        WeekAndYear(
            year=dto.year,
            week=dto.week
        ),
        dto.time
    )

@router.put("/users/me/statistics/week-study-time/average-per-session")
def update_week_time_average_study_time(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: UpdateWeekStudyTime
):
    study_tracker_service.update_week_time_average_study_time(
        user_id, 
        WeekAndYear(
            year=dto.year,
            week=dto.week
        ),
        dto.time
    )
