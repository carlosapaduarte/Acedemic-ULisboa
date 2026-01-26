from abc import ABC, abstractmethod
from datetime import datetime, date
from typing import Optional

from domain.study_tracker import Archive, CurricularUnit, DailyEnergyStatus, Event, Grade, Task, UnavailableScheduleBlock, WeekAndYear, WeekTimeStudy

class StudyTrackerRepo(ABC):
    @abstractmethod
    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        pass

    @abstractmethod
    def create_event(self, user_id: int, event: Event):
        pass
    
    @abstractmethod
    def update_event(self, user_id: int, event_id: int, event: Event):
        pass
    
    @abstractmethod
    def delete_event(self, user_id: int, event_id: int):
        pass
    
    @abstractmethod
    def delete_events(self, user_id: int, title: str):
        pass

    @abstractmethod
    def get_events(
        self, 
        user_id: int, 
        filter_today: bool, 
        recurrentEvents: bool, 
        study_events: bool, 
        week_number: int | None
    ) -> list[Event]:
        pass

    @abstractmethod
    def update_user_study_tracker_use_goals(self, user_id: int, use_goals: set[int]):
        pass

    @abstractmethod
    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        pass

    @abstractmethod
    def create_not_available_schedule_block(self, user_id: int, info: UnavailableScheduleBlock):
        pass

    @abstractmethod
    def get_not_available_schedule_blocks(self, user_id: int) -> list[UnavailableScheduleBlock]:
        pass
    
    @abstractmethod
    def get_tasks(
        self, 
        user_id: int, 
        order_by_deadline_and_priority: bool, 
        filter_uncompleted_tasks: bool, 
        filter_deadline_is_today: bool, 
        year: int | None, 
        week: int | None
    ) -> list[Task]:
        pass

    @abstractmethod
    def get_task(self, user_id: int, task_id: int) -> Task:
        pass

    @abstractmethod
    def create_task(self, user_id: int, task: Task, task_id: int | None) -> int:
        pass
    
    @abstractmethod
    def update_task(self, user_id: int, task_id: int, task: Task):
        pass

    @abstractmethod
    def update_task_status(self, user_id: int, task_id: int, new_status: str):
        pass
    
    @abstractmethod
    def delete_task(self, user_id: int, task_id: int):
        pass

    @abstractmethod
    def delete_future_slots_for_task(self, user_id: int, task_id: int):
        pass
    
    @abstractmethod
    def create_archive(self, user_id: int, name: str):
        pass
    
    @abstractmethod
    def get_archives(self, user_id: int) -> list[Archive]:
        pass
    
    @abstractmethod
    def create_file(self, user_id: int, archive_name: str, name: str, text_content: str = ""):
        pass
    
    @abstractmethod
    def update_file_content(self, user_id: int, archive_name: str, filename: str, new_content: str):
        pass
    
    @abstractmethod
    def get_curricular_units(self, user_id: int) -> list[CurricularUnit]:
        pass
    
    @abstractmethod
    def create_curricular_unit(self, user_id: int, name: str):
        pass

    @abstractmethod
    def create_grade(self, user_id: int, curricular_unit: str, grade: Grade):
        pass

    @abstractmethod
    def delete_grade(self, user_id: int, curricular_unit_name: str, grade_id: int):
        pass
    
    @abstractmethod
    def create_mood_log(self, user_id: int, value: int, label: str, emotions: list[str], impacts: list[str], date_log: datetime):
        pass

    @abstractmethod
    def create_daily_tags(self, user_id: int, tags: list[str], _date: date):
        pass

    @abstractmethod
    def get_daily_tags(self, user_id: int, _date: date) -> list[str]:
        pass
    
    @abstractmethod
    def get_time_spent_by_tag(self, user_id: int) -> dict[int, dict[int, dict[str, int]]]:
        pass
    
    @abstractmethod
    def get_total_time_study_per_week(self, user_id: int) -> list[WeekTimeStudy]:
        pass
    
    @abstractmethod
    def increment_week_study_time(self, user_id: int, week_and_year: WeekAndYear, minutes: int):
        pass

    @abstractmethod
    def override_study_session_start_date(self, user_id: int):
        pass

    @abstractmethod
    def get_study_session_start_date(self, user_id: int) -> datetime:
        pass

    @abstractmethod
    def update_week_time_average_study_time(self, user_id: int, week_and_year: WeekAndYear, study_session_time: int):
        pass

    @abstractmethod
    def delete_tag(self, session, tag_id: int) -> bool:
        pass