import datetime
from domain.study_tracker import UnavailableScheduleBlock
from exception import NotAvailableScheduleBlockCollision
from repository.sql.study_tracker.repo_sql import StudyTrackerSqlRepo
from router.study_tracker.dtos.input_dtos import CreateScheduleNotAvailableBlock
from router.study_tracker.dtos.output_dtos import StudyTrackerTaskOutputDto

study_tracker_repo = StudyTrackerSqlRepo()

def update_user_study_tracker_use_goals(user_id: int, use_goals: set):
    study_tracker_repo.update_user_study_tracker_use_goals(user_id, use_goals)

def update_study_tracker_app_planning_day(user_id: int, day: int, hour: int):
    study_tracker_repo.update_study_tracker_app_planning_day(user_id, day, hour)

def collides(task_start_date: datetime, task_end_date: datetime, block: UnavailableScheduleBlock):
    block_start_hour = block.start_hour
    block_end_hour = block.start_hour + block.duration
    task_start_hour = task_start_date.time().hour
    task_end_hour = task_end_date.time().hour

    if task_start_hour < block_start_hour:
        if task_end_hour <= block_start_hour:
            return False
        return True
    if  task_start_hour == block_start_hour:
        return True
    if task_start_hour > block_start_hour and task_start_hour < block_end_hour:
        return True
    
    return False

def create_new_study_tracker_task(user_id: int, title: str, start_date: datetime, end_date: datetime, tags: list[str]):
    # Don't allow to create task where schedule block is of type: not available
    not_available_blocks = study_tracker_repo.get_not_available_schedule_blocks(user_id)
    for block in not_available_blocks:
        if collides(start_date, end_date, block):
             raise NotAvailableScheduleBlockCollision()
            
    study_tracker_repo.create_new_study_tracker_task(user_id, title, start_date, end_date, tags)

def update_receive_notifications_pref(user_id: int, receive: bool):
    study_tracker_repo.update_receive_notifications_pref(user_id, receive)

def get_today_tasks(user_id: int) -> list[StudyTrackerTaskOutputDto]:
    stored_tasks = study_tracker_repo.get_study_tracker_today_tasks(user_id)
    return StudyTrackerTaskOutputDto.from_study_tracker_tasks(stored_tasks)

def get_tasks(user_id: int) -> list[StudyTrackerTaskOutputDto]:
    stored_tasks = study_tracker_repo.get_study_tracker_tasks(user_id)
    return StudyTrackerTaskOutputDto.from_study_tracker_tasks(stored_tasks)

def create_schedule_not_available_block(user_id: int, info: UnavailableScheduleBlock):
    study_tracker_repo.create_not_available_schedule_block(user_id, info)