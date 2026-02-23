from datetime import datetime
from domain.study_tracker import Archive, CurricularUnit, MoodLog, DailyEnergyStatus, DateInterval, Event, Grade, SlotToWork, Task, UnavailableScheduleBlock, WeekAndYear, WeekTimeStudy, verify_time_of_day
from exception import InvalidDate, NotAvailableScheduleBlockCollision, NotFoundException
from repository.sql.study_tracker.repo_sql import StudyTrackerSqlRepo
from utils import get_datetime_utc
from datetime import date
from router.study_tracker.dtos.input_dtos import CreateMoodLogInputDto
study_tracker_repo = StudyTrackerSqlRepo()

FALLBACK_COLOR = "#3399FF"

def update_user_study_tracker_use_goals(user_id: int, use_goals: set[int]):
    study_tracker_repo.update_user_study_tracker_use_goals(user_id, use_goals)

def update_study_tracker_app_planning_day(user_id: int, day: int, hour: int):
    study_tracker_repo.update_study_tracker_app_planning_day(user_id, day, hour)
    
def does_not_collide_with_unavailable_block(
    user_id: int,
    event_date_interval: DateInterval
):
    # Don't allow to create event where schedule block is of type: not available
    not_available_blocks = study_tracker_repo.get_not_available_schedule_blocks(user_id)
    for block in not_available_blocks:
        if event_date_interval.collides_with_unavailable_block(block):
            raise NotAvailableScheduleBlockCollision()
        
def verify_start_end_date_validity(date: DateInterval):
    if date.start_date >= date.end_date:
        raise InvalidDate()

def create_event(user_id: int, event: Event) -> Event:
    
    if event.color is None:
        event.color = FALLBACK_COLOR
    
    does_not_collide_with_unavailable_block(user_id, event.date)
    verify_start_end_date_validity(event.date)
    created_event = study_tracker_repo.create_event(user_id, event)
    return created_event
    
def update_event(user_id: int, event_id: int, event: Event):
    if event.color is None:
        event.color = FALLBACK_COLOR
    
    does_not_collide_with_unavailable_block(user_id, event.date)
    study_tracker_repo.update_event(user_id, event_id, event)

def delete_event(user_id: int, event_id: int):
    study_tracker_repo.delete_event(user_id, event_id)

def update_receive_notifications_pref(user_id: int, receive: bool):
    study_tracker_repo.update_receive_notifications_pref(user_id, receive)

def get_events(user_id: int, today: bool, recurrentEvents: bool, study_events: bool, week_number: int | None) -> list[Event]:
    return study_tracker_repo.get_events(user_id, today, recurrentEvents, study_events, week_number)

def create_schedule_not_available_block(user_id: int, info: UnavailableScheduleBlock):
    study_tracker_repo.create_not_available_schedule_block(user_id, info)

def create_event_from_task(user_id: int, task: Task, slot: SlotToWork, task_id: int):
    associatedEvent = Event(
        id=None,
        title=task.title,
        date=DateInterval(
            start_date=slot.start_time,
            end_date=slot.end_time
        ),
        tags=task.tags,
        every_week=False,
        every_day=False,
        task_id=task_id
    )
    create_event(user_id, associatedEvent)

def create_task(user_id: int, task: Task, slotsToWork: list[SlotToWork]) -> int:
    new_task_id = study_tracker_repo.create_task(user_id, task, task_id=None)

    for slot in slotsToWork:
        create_event_from_task(user_id, task, slot, new_task_id)
        
    return new_task_id

def update_task(user_id: int, task_id: int, updated_task: Task, slotsToWork: list[SlotToWork], previous_task_name: str):
    study_tracker_repo.update_task(user_id, task_id, updated_task)
    study_tracker_repo.delete_events(user_id, previous_task_name)
    for slot in slotsToWork:
        create_event_from_task(user_id, updated_task, slot)

def get_user_daily_tasks_progress(user_id: int, year: int, week: int) -> list[tuple[date, float]]:
    week_tasks = study_tracker_repo.get_tasks(user_id, False, False, False, year, week)
    
    tasks_by_day: dict[date, list[Task]] = {}
    for task in week_tasks:
        deadline = task.deadline
        
        # Should not happen because we asked for tasks with a specific year and week
        if deadline is None:
            raise
        
        
        task_date = deadline.date()
        if tasks_by_day.get(task_date) is None:
            tasks_by_day[task_date] = [task]
        else:
            tasks_by_day[task_date].append(task)
            
    progress_by_day: list[tuple[date, float]] = []
    for task_date, tasks in tasks_by_day.items():
        number_of_daily_tasks = len(tasks)
        if number_of_daily_tasks == 0:
            progress_by_day.append((task_date, 0))
        else:
            completed = 0    
            for task in tasks:
                if task.status == "completed":
                    completed += 1
            progress_by_day.append((task_date, completed / number_of_daily_tasks))
            
    return progress_by_day

def get_user_tasks(
    user_id: int,
    order_by_deadline_and_priority: bool, 
    filter_uncompleted_tasks: bool, 
    filter_deadline_is_today: bool    
) -> list[Task]:
    return study_tracker_repo.get_tasks(
        user_id, 
        order_by_deadline_and_priority, 
        filter_uncompleted_tasks, 
        filter_deadline_is_today,
        None,
        None
    )

def get_user_task(user_id: int, task_id: int) -> Task:
    try:
        return study_tracker_repo.get_task(user_id, task_id)
    except Exception as e:
        raise NotFoundException(user_id)

def update_task_status(user_id: int, task_id: int, new_status: str):
    study_tracker_repo.update_task_status(user_id, task_id, new_status)

    if new_status == "completed":
        delete_future_slots_for_task(user_id, task_id)

def delete_task(user_id: int, task_id: int):
    """Apaga uma tarefa pelo ID."""
    try:
        study_tracker_repo.delete_task(user_id, task_id)
    except Exception as e:
        raise NotFoundException(f"Task {task_id} to delete not found")
    
def delete_future_slots_for_task(user_id: int, task_id: int):
    study_tracker_repo.delete_future_slots_for_task(user_id, task_id) 

def create_archive(user_id: int, name: str):
    study_tracker_repo.create_archive(user_id, name)
    
def get_archives(user_id: int) -> list[Archive]:
    return study_tracker_repo.get_archives(user_id)

def create_file(user_id: int, archive_name: str, name: str):
    study_tracker_repo.create_file(user_id, archive_name, name)

def update_file_content(user_id: int, archive_name: str, filename: str, new_content: str):
    study_tracker_repo.update_file_content(user_id, archive_name, filename, new_content)
    
def get_curricular_units(user_id: int) -> list[CurricularUnit]:
    return study_tracker_repo.get_curricular_units(user_id)

def create_curricular_unit(user_id: int, name: str):
    return study_tracker_repo.create_curricular_unit(user_id, name)

def create_grade(user_id: int, curricular_unit: str, grade: Grade):
    return study_tracker_repo.create_grade(user_id, curricular_unit, grade)

def delete_grade(user_id: int, curricular_unit_name: str, grade_id: int):
    return study_tracker_repo.delete_grade(user_id, curricular_unit_name, grade_id)

def create_mood_log(user_id: int, dto: CreateMoodLogInputDto):
    # Converter timestamp para datetime
    log_date = datetime.fromtimestamp(dto.date)
    
    study_tracker_repo.create_mood_log(
        user_id,
        dto.value,
        dto.label,
        dto.emotions,
        dto.impacts,
        log_date
    )

def create_daily_energy_status(user_id: int, level: int, time_of_day: str):
    if not verify_time_of_day(time_of_day):
        raise # TODO
        
    today = date.today()
    status = DailyEnergyStatus(
        today,
        time_of_day,
        level
    )
    study_tracker_repo.create_or_override_daily_energy_status(user_id, status)

def create_daily_tags(user_id: int, tags: list[str]):
    today = date.today()
    study_tracker_repo.create_daily_tags(user_id, tags, today)

def get_daily_tags(user_id: int) -> list[str]:
    today = date.today()
    return study_tracker_repo.get_daily_tags(user_id, today)

def get_daily_energy_history(user_id: int) -> list[DailyEnergyStatus]:
    return study_tracker_repo.get_daily_energy_history(user_id)

def get_task_time_distribution(user_id: int) -> dict[int, dict[int, dict[str, int]]]:
    return study_tracker_repo.get_time_spent_by_tag(user_id)

def get_total_time_study_per_week(user_id: int) -> list[WeekTimeStudy]:
    stats_by_week = study_tracker_repo.get_total_time_study_per_week(user_id)
    for week in stats_by_week:
        week_study_time_target = get_week_study_time_target(user_id, week.week_and_year.week)
        week.target = week_study_time_target
    return stats_by_week

"""
    dat_1 < dat_2.
"""
def elapsed_minutes(dat_1: datetime, dat_2: datetime) -> int:
    minutes_1 = get_datetime_utc(dat_1) / 60
    minutes_2 = get_datetime_utc(dat_2) / 60
    return (int) (minutes_2 - minutes_1)

def get_week_study_time_target(user_id: int, week_number: int) -> int:
    events = get_events(user_id, False, False, True, week_number)
    total: int = 0
    for event in events:
        total += elapsed_minutes(event.date.start_date, event.date.end_date)
    return total

"""
def increment_week_study_time(user_id: int, week_and_year: WeekAndYear, minutes: int):
    study_tracker_repo.increment_week_study_time(user_id, week_and_year, minutes)
"""
def start_new_study_session(user_id: int):
    study_tracker_repo.override_study_session_start_date(user_id)
    
"""
    Should be called after start_new_study_session();
    Fetches last stored study session start date, and computes minutes elapsed until now.
    Then, uses that information to update the current week time average study time, and the total week study time.
"""
def finish_study_session(user_id: int):
    start_time = study_tracker_repo.get_study_session_start_date(user_id)
    now = datetime.now()
    
    study_session_duration_min = elapsed_minutes(start_time, now)
    
    cur_week_number = now.isocalendar()[1]
    week_and_year = WeekAndYear(
        year=now.year,
        week=cur_week_number
    )
    
    study_tracker_repo.increment_week_study_time(user_id, week_and_year, study_session_duration_min)
    study_tracker_repo.update_week_time_average_study_time(user_id, week_and_year, study_session_duration_min)
    
"""
def update_week_time_average_study_time(user_id: int, week_and_year: WeekAndYear, study_session_time: int):
    study_tracker_repo.update_week_time_average_study_time(user_id, week_and_year, study_session_time)
"""

def get_mood_logs(user_id: int) -> list[MoodLog]:
    """
    Obtém o histórico de mood logs do repositório.
    """
    return study_tracker_repo.get_mood_logs(user_id)

def mark_tutorial_as_seen(user_id: int, tutorial_key: str):
    study_tracker_repo.mark_tutorial_as_seen(user_id, tutorial_key)