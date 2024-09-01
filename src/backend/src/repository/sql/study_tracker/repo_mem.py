from datetime import datetime
from domain.study_tracker.task import StudyTrackerTask
from repository.sql.study_tracker.repo import StudyTrackerRepo

class StudyTrackerMemRepo(StudyTrackerRepo):

    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        pass

    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        pass

    def create_new_study_tracker_task(self, user_id: int, title: str, start_date: datetime, end_date: datetime, tag: str):
        pass

    def get_study_tracker_today_tasks(self, user_id: int):
        pass

    def get_study_tracker_tasks(self, user_id: int) -> list[StudyTrackerTask]:
        pass