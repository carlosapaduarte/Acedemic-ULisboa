from abc import ABC, abstractmethod

from domain.study_tracker import Event, Task, UnavailableScheduleBlock

class StudyTrackerRepo(ABC):
    @abstractmethod
    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        pass

    @abstractmethod
    def create_event(self, user_id: int, event: Event):
        pass

    @abstractmethod
    def get_events(self, user_id: int) -> list[Event]:
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
    def get_tasks(self, user_id: int, order_by_deadline_and_priority: bool) -> list[Task]:
        pass

    @abstractmethod
    def create_task(self, user_id: int, task: Task) -> int:
        pass

    @abstractmethod
    def update_task_status(self, user_id: int, task_id: int, new_status: str):
        pass