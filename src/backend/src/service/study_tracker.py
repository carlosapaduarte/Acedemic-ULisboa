from domain.study_tracker import EventDate, Event, Task, UnavailableScheduleBlock
from exception import NotAvailableScheduleBlockCollision
from repository.sql.study_tracker.repo_sql import StudyTrackerSqlRepo
from router.study_tracker.dtos.output_dtos import StudyTrackerEventOutputDto
from datetime import datetime

study_tracker_repo = StudyTrackerSqlRepo()

def update_user_study_tracker_use_goals(user_id: int, use_goals: set[int]):
    study_tracker_repo.update_user_study_tracker_use_goals(user_id, use_goals)

def update_study_tracker_app_planning_day(user_id: int, day: int, hour: int):
    study_tracker_repo.update_study_tracker_app_planning_day(user_id, day, hour)

def require_available_schedule_block(
    user_id: int,
    event_date: EventDate
):
    # Don't allow to create event where schedule block is of type: not available
    not_available_blocks = study_tracker_repo.get_not_available_schedule_blocks(user_id)
    for block in not_available_blocks:
        if event_date.collides_with_unavailable_block(block):
            raise NotAvailableScheduleBlockCollision()

def create_event(user_id: int, event: Event):
    require_available_schedule_block(user_id, event.date)
    study_tracker_repo.create_event(user_id, event)

def update_receive_notifications_pref(user_id: int, receive: bool):
    study_tracker_repo.update_receive_notifications_pref(user_id, receive)

def get_today_events(user_id: int) -> list[StudyTrackerEventOutputDto]:
    stored_events = study_tracker_repo.get_events(user_id)
    return StudyTrackerEventOutputDto.from_events(stored_events)

def get_events(user_id: int) -> list[StudyTrackerEventOutputDto]:
    stored_events = study_tracker_repo.get_events(user_id)
    return StudyTrackerEventOutputDto.from_events(stored_events)

def create_schedule_not_available_block(user_id: int, info: UnavailableScheduleBlock):
    study_tracker_repo.create_not_available_schedule_block(user_id, info)
    
def get_user_tasks(user_id: int, order_by_deadline_and_priority: bool) -> list[Task]:
    return study_tracker_repo.get_tasks(user_id, order_by_deadline_and_priority)

def create_event_from_task(user_id: int, task: Task):
    associatedEvent = Event(
        title=task.title,
        date=EventDate(
            start_date=datetime.now(),
            end_date=task.deadline
        ),
        tags=task.tags
    )
    create_event(user_id, associatedEvent)

def create_task(user_id: int, task: Task, createAssociatedEvent: bool) -> int:
    if createAssociatedEvent:
        create_event_from_task(user_id, task)
        
    return study_tracker_repo.create_task(user_id, task)

def update_task_status(user_id: int, task_id: int, new_status: str):
    study_tracker_repo.update_task_status(user_id, task_id, new_status)