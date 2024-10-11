from abc import ABC, abstractmethod
from datetime import datetime

from domain.study_tracker import Archive, CurricularUnit, Event, Grade, Task, UnavailableScheduleBlock

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
    def get_events(self, user_id: int, filter_today: bool, recurrentEvents: bool) -> list[Event]:
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
    def get_tasks(self, user_id: int, order_by_deadline_and_priority: bool, filter_uncompleted_tasks: bool) -> list[Task]:
        pass

    @abstractmethod
    def create_task(self, user_id: int, task: Task) -> int:
        pass

    @abstractmethod
    def update_task_status(self, user_id: int, task_id: int, new_status: str):
        pass
    
    @abstractmethod
    def create_archive(self, user_id: int, name: str):
        pass
    
    @abstractmethod
    def get_archives(self, user_id: int) -> list[Archive]:
        pass
    
    @abstractmethod
    def create_file(self, user_id: int, archive_name: str, name: str):
        pass
    
    @abstractmethod
    def update_file_content(self, user_id: int, archive_name: str, filename: str, new_content: str):
        pass
    
    @abstractmethod
    def get_curricular_units(self, user_id: int) -> list[CurricularUnit]:
        pass
    
    @abstractmethod
    def create_grade(self, user_id: int, curricular_unit: str, grade: Grade):
        pass
    
    @abstractmethod
    def create_daily_energy_stat(self, user_id: int, date: datetime, energy_level: int):
        pass
    
    @abstractmethod
    def get_time_spent_by_tag(self, user_id: int) -> dict[int, dict[int, dict[str, int]]]:
        pass