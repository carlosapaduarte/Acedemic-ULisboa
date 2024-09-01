from abc import ABC, abstractmethod
import datetime

from domain.study_tracker.task import StudyTrackerTask

class StudyTrackerRepo(ABC):
    @abstractmethod
    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        pass

    @abstractmethod
    def create_new_study_tracker_task(self, user_id: int, title: str, start_date: datetime, end_date: datetime, tag: str):
        pass

    @abstractmethod
    def get_study_tracker_today_tasks(self, user_id: int) -> list[StudyTrackerTask]:
        pass

    @abstractmethod
    def get_study_tracker_tasks(self, user_id: int) -> list[StudyTrackerTask]:
        pass

    @abstractmethod
    def update_user_study_tracker_use_goals(self, user_id: int, avatar_filename: str):
        pass

    @abstractmethod
    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        pass