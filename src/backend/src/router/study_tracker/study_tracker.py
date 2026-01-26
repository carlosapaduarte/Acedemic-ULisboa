from datetime import datetime
from http.client import HTTPException
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Response, Query

from domain.study_tracker import DateInterval, Event, Grade, SlotToWork, Task, UnavailableScheduleBlock
from router.commons.common import get_current_user_id
from router.study_tracker.dtos.input_dtos import CreateArchiveInputDto, CreateCurricularUnitInputDto, CreateDailyTags, CreateFileInputDto, CreateGradeInputDto, CreateTaskInputDto, CreateEventInputDto, CreateScheduleNotAvailableBlockInputDto, EditTaskInputDto, SetStudyTrackerAppUseGoalsInputDto, UpdateEventInputDto, UpdateFileInputDto, UpdateStudyTrackerReceiveNotificationsPrefInputDto, UpdateStudyTrackerWeekPlanningDayInputDto, UpdateTaskStatus, CreateMoodLogInputDto
from router.study_tracker.dtos.output_dtos import ArchiveOutputDto, CurricularUnitOutputDto,MoodLogOutputDto, DailyEnergyStatusOutputDto, DailyTasksProgressOutputDto, EventOutputDto, UserTaskOutputDto, WeekTimeStudyOutputDto
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
    
    task_id = study_tracker_service.create_task(
        user_id, 
        Task.from_create_task_input_dto(dto), 
        SlotToWork.from_slot_to_work_input_dto(slots_to_work)
    )
    task = study_tracker_service.get_user_task(user_id, task_id)
    return UserTaskOutputDto.from_Task(task)

@router.put("/users/me/tasks/{task_id}")
def update_task(
    user_id: Annotated[int, Depends(get_current_user_id)],
    task_id: int,
    dto: EditTaskInputDto
):
    slots_to_work = []
    if dto.updated_task.slotsToWork is not None:
        slots_to_work = dto.updated_task.slotsToWork
    
    study_tracker_service.update_task(
        user_id,
        task_id,
        Task.from_create_task_input_dto(dto.updated_task), 
        SlotToWork.from_slot_to_work_input_dto(slots_to_work),
        dto.previous_task_name
    )
    
@router.put("/users/me/tasks/{task_id}/status")
def update_task_status(
    user_id: Annotated[int, Depends(get_current_user_id)],
    task_id: int,
    dto: UpdateTaskStatus
):
    study_tracker_service.update_task_status(user_id, task_id, dto.newStatus)

@router.delete("/users/me/tasks/{task_id}", status_code=204)
def delete_task(
    user_id: Annotated[int, Depends(get_current_user_id)],
    task_id: int
) -> Response:
    study_tracker_service.delete_task(user_id, task_id)
    return Response(status_code=204)

@router.get("/users/me/tasks")
def get_tasks(
    user_id: Annotated[int, Depends(get_current_user_id)],
    orderByDeadlineAndPriority: bool,
    filterUncompletedTasks: bool
) -> list[UserTaskOutputDto]:
    tasks = study_tracker_service.get_user_tasks(user_id, orderByDeadlineAndPriority, filterUncompletedTasks, False)
    return UserTaskOutputDto.from_Tasks(tasks)

@router.get("/users/me/tasks/{task_id}")
def get_task(
    user_id: Annotated[int, Depends(get_current_user_id)],
    task_id: int
) -> UserTaskOutputDto:
    task = study_tracker_service.get_user_task(user_id, task_id)
    return UserTaskOutputDto.from_Task(task)

@router.get("/users/me/statistics/daily-tasks-progress")
def get_daily_tasks_progress(
    user_id: Annotated[int, Depends(get_current_user_id)],
    year: int,
    week: int,
) -> list[DailyTasksProgressOutputDto]:
    res = study_tracker_service.get_user_daily_tasks_progress(user_id, year, week)
    return DailyTasksProgressOutputDto.from_domain(res)

@router.get("/users/me/events")
def get_events(
    user_id: Annotated[int, Depends(get_current_user_id)],
    today: bool = False,
    recurrentEvents: bool = False,
    studyEvents: bool = False,
    weekNumber: int | None = Query(None)
) -> list[EventOutputDto]: 
    domain_events = study_tracker_service.get_events(
        user_id, 
        today, 
        recurrentEvents, 
        studyEvents, 
        weekNumber
    )
    
    return EventOutputDto.from_events(domain_events)

@router.post("/users/me/events")
def create_event(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateEventInputDto
) -> Response:
    rec_start = None 
    try:
        if dto.recurrenceStart:
            rec_start = datetime.fromtimestamp(dto.recurrenceStart)
    except (OSError, ValueError):
        print(f"Erro data inicio rec ignorado: {dto.recurrenceStart}")
        rec_start = None

    rec_end = None
    try:
        if dto.recurrenceEnd:
            rec_end = datetime.fromtimestamp(dto.recurrenceEnd)
    except (OSError, ValueError):
        print(f"Erro data fim rec ignorado: {dto.recurrenceEnd}")
        rec_end = None

    study_tracker_service.create_event(
        user_id, 
        Event(
            id=None,
            title=dto.title,
            date=DateInterval(
                start_date=datetime.fromtimestamp(dto.startDate),
                end_date=datetime.fromtimestamp(dto.endDate)
            ),
            tags=dto.tags,
            every_week=dto.everyWeek,
            every_day=dto.everyDay,
            color=dto.color,
            notes=dto.notes,
            is_uc=dto.is_uc,
            recurrence_start=rec_start,
            recurrence_end=rec_end
        )
    )
    return Response()

@router.put("/users/me/events/{event_id}")
def update_event(
    user_id: Annotated[int, Depends(get_current_user_id)],
    event_id: int,
    dto: UpdateEventInputDto
) -> Response:
    rec_start = None 
    try:
        if dto.recurrenceStart:
            rec_start = datetime.fromtimestamp(dto.recurrenceStart)
    except (OSError, ValueError):
        rec_start = None

    rec_end = None
    try:
        if dto.recurrenceEnd:
            rec_end = datetime.fromtimestamp(dto.recurrenceEnd)
    except (OSError, ValueError):
        rec_end = None

    study_tracker_service.update_event(
        user_id,
        event_id,
        Event(
            id=event_id,
            title=dto.title,
            date=DateInterval(
                    start_date=datetime.fromtimestamp(dto.startDate),
                    end_date=datetime.fromtimestamp(dto.endDate)
                ),
            tags=dto.tags,
            every_week=dto.everyWeek,
            every_day=dto.everyDay,
            color=dto.color,
            notes=dto.notes,
            is_uc=dto.is_uc,
            recurrence_start=rec_start,
            recurrence_end=rec_end
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
        id=None,
        value=dto.value,
        weight=dto.weight
    ))

@router.delete("/users/me/curricular-units/{curricular_unit_name}/grades/{grade_id}")
def delete_grade(
    user_id: Annotated[int, Depends(get_current_user_id)],
    curricular_unit_name: str,
    grade_id: int
) -> Response:
    study_tracker_service.delete_grade(user_id, curricular_unit_name, grade_id)
    return Response(status_code=204)

@router.post("/users/me/mood-logs")
def create_mood_log(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateMoodLogInputDto
):
    study_tracker_service.create_mood_log(user_id, dto)

@router.get("/users/me/mood-logs")
def get_mood_logs(
    user_id: Annotated[int, Depends(get_current_user_id)]
) -> list[MoodLogOutputDto]:
    
    mood_logs = study_tracker_service.get_mood_logs(user_id)
    return MoodLogOutputDto.from_domain(mood_logs)
@router.post("/users/me/statistics/daily-tags")
def create_daily_tags(
    user_id: Annotated[int, Depends(get_current_user_id)],
    dto: CreateDailyTags
):
    study_tracker_service.create_daily_tags(user_id, dto.tags)
    
@router.get("/users/me/statistics/daily-tags")
def get_daily_tags(
    user_id: Annotated[int, Depends(get_current_user_id)]
) -> list[str]:
    return study_tracker_service.get_daily_tags(user_id)
    


@router.get("/users/me/statistics/time-by-event-tag")
def get_task_time_distribution(
    user_id: Annotated[int, Depends(get_current_user_id)]
) -> dict[int, dict[int, dict[str, int]]]:
    return study_tracker_service.get_task_time_distribution(user_id)

@router.get("/users/me/statistics/week-study-time")
def get_study_time_by_week(
    user_id: Annotated[int, Depends(get_current_user_id)]
) ->  list[WeekTimeStudyOutputDto]:
    stats_by_week = study_tracker_service.get_total_time_study_per_week(user_id)
    return WeekTimeStudyOutputDto.from_domain(stats_by_week)
    
@router.put("/users/me/week-study-time-session")
def start_new_study_session(
    user_id: Annotated[int, Depends(get_current_user_id)],
):
    study_tracker_service.start_new_study_session(user_id)
    
@router.delete("/users/me/week-study-time-session")
def finish_study_session(
    user_id: Annotated[int, Depends(get_current_user_id)],
):
    study_tracker_service.finish_study_session(user_id)