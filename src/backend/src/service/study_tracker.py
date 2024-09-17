from domain.study_tracker import Archive, CurricularUnit, DateInterval, Event, Grade, Task, UnavailableScheduleBlock
from exception import NotAvailableScheduleBlockCollision
from repository.sql.study_tracker.repo_sql import StudyTrackerSqlRepo
from datetime import datetime

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

def update_receive_notifications_pref(user_id: int, receive: bool):
    study_tracker_repo.update_receive_notifications_pref(user_id, receive)

def get_today_events(user_id: int) -> list[Event]:
    return study_tracker_repo.get_events(user_id, True)

def get_events(user_id: int) -> list[Event]:
    return study_tracker_repo.get_events(user_id, False)

def create_schedule_not_available_block(user_id: int, info: UnavailableScheduleBlock):
    study_tracker_repo.create_not_available_schedule_block(user_id, info)

def create_event_from_task(user_id: int, task: Task):
    associatedEvent = Event(
        title=task.title,
        date=DateInterval(
            start_date=datetime.now(),
            end_date=task.deadline
        ),
        tags=task.tags,
        every_week=False
    )
    create_event(user_id, associatedEvent)

def create_task(user_id: int, task: Task, createAssociatedEvent: bool) -> int:
    if createAssociatedEvent:
        create_event_from_task(user_id, task)
        
    return study_tracker_repo.create_task(user_id, task)

def get_user_tasks(user_id: int, order_by_deadline_and_priority: bool) -> list[Task]:
    return study_tracker_repo.get_tasks(user_id, order_by_deadline_and_priority)

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