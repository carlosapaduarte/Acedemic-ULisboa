import datetime
from domain.study_tracker import UnavailableScheduleBlock
from repository.sql.study_tracker.repo_sql import StudyTrackerSqlRepo
from router.study_tracker.dtos.input_dtos import CreateScheduleNotAvailableBlock
from router.study_tracker.dtos.output_dtos import StudyTrackerTaskOutputDto

study_tracker_repo = StudyTrackerSqlRepo()

def update_user_study_tracker_use_goals(user_id: int, use_goals: set):
    study_tracker_repo.update_user_study_tracker_use_goals(user_id, use_goals)

def update_study_tracker_app_planning_day(user_id: int, day: int, hour: int):
    study_tracker_repo.update_study_tracker_app_planning_day(user_id, day, hour)

def create_new_study_tracker_task(user_id: int, title: str, start_date: datetime, end_date: datetime, tags: list[str]):
    study_tracker_repo.create_new_study_tracker_task(user_id, title, start_date, end_date, tags)

def update_receive_notifications_pref(user_id: int, receive: bool):
    study_tracker_repo.update_receive_notifications_pref(user_id, receive)

def get_study_tracker_today_tasks(user_id: int) -> list[StudyTrackerTaskOutputDto]:
    stored_tasks = study_tracker_repo.get_study_tracker_today_tasks(user_id)
    return StudyTrackerTaskOutputDto.from_study_tracker_tasks(stored_tasks)

def get_study_tracker_tasks(user_id: int) -> list[StudyTrackerTaskOutputDto]:
    stored_tasks = study_tracker_repo.get_study_tracker_tasks(user_id)
    return StudyTrackerTaskOutputDto.from_study_tracker_tasks(stored_tasks)

def create_schedule_not_available_block(user_id: int, info: UnavailableScheduleBlock):
    study_tracker_repo.create_schedule_not_available_block(user_id, info)