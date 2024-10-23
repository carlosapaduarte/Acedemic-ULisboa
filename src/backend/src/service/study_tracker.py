from datetime import datetime
from domain.study_tracker import Archive, CurricularUnit, DailyEnergyStatus, DateInterval, Event, Grade, SlotToWork, Task, UnavailableScheduleBlock, WeekAndYear, WeekTimeStudy
from exception import AlreadyExistsException, NotAvailableScheduleBlockCollision, NotFoundException
from repository.sql.study_tracker.repo_sql import StudyTrackerSqlRepo
from utils import get_datetime_utc
from datetime import date


study_tracker_repo = StudyTrackerSqlRepo()

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

def create_event(user_id: int, event: Event):
    does_not_collide_with_unavailable_block(user_id, event.date)
    study_tracker_repo.create_event(user_id, event)
    
def update_event(user_id: int, event_id: int, event: Event):
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

def create_event_from_task(user_id: int, task: Task, slot: SlotToWork):
    associatedEvent = Event(
        title=task.title,
        date=DateInterval(
            start_date=slot.start_time,
            end_date=slot.end_time
        ),
        tags=task.tags,
        every_week=False
    )
    create_event(user_id, associatedEvent)

def create_task(user_id: int, task: Task, slotsToWork: list[SlotToWork]) -> int:
    for slot in slotsToWork:
        create_event_from_task(user_id, task, slot)
        
    return study_tracker_repo.create_task(user_id, task)

def get_user_daily_tasks_progress(user_id: int) -> float:
    daily_tasks = study_tracker_repo.get_tasks(user_id, False, False, True)
    number_of_daily_tasks = len(daily_tasks)
    
    if number_of_daily_tasks is 0:
        return 0
    
    completed = 0    
    for task in daily_tasks:
        if task.status == "Tarefa Completa":
            completed += 1
            
    return completed / number_of_daily_tasks
    

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
        filter_deadline_is_today
    )

def get_user_task(user_id: int, task_id: int) -> Task:
    # TODO: improve later
    user_tasks = get_user_tasks(user_id, False, False, False)
    for task in user_tasks:
        if task.id == task_id:
            return task
    raise NotFoundException(user_id)

def update_task_status(user_id: int, task_id: int, new_status: str):
    study_tracker_repo.update_task_status(user_id, task_id, new_status)
    
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

def create_daily_energy_status(user_id: int, level: int):
    if not study_tracker_repo.is_today_energy_status_created(user_id):
        today = date.today()
        status = DailyEnergyStatus(
            today,
            level
        )
        study_tracker_repo.create_daily_energy_status(user_id, status)
    else:
        raise AlreadyExistsException()

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

def increment_week_study_time(user_id: int, week_and_year: WeekAndYear, minutes: int):
    study_tracker_repo.increment_week_study_time(user_id, week_and_year, minutes)
    
def update_week_time_average_study_time(user_id: int, week_and_year: WeekAndYear, study_session_time: int):
    study_tracker_repo.update_week_time_average_study_time(user_id, week_and_year, study_session_time)