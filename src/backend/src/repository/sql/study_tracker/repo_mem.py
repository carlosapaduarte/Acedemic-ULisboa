from domain.study_tracker import Archive, CurricularUnit, Event, Grade, Task, UnavailableScheduleBlock
from repository.sql.study_tracker.repo import StudyTrackerRepo

class StudyTrackerMemRepo(StudyTrackerRepo):

    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        pass

    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        pass

    def create_event(self, user_id: int, event: Event):
        pass

    def get_events(self, user_id: int, filter_today: bool) -> list[Event]:
        pass
    
    def create_not_available_schedule_block(self, user_id: int, info: UnavailableScheduleBlock):
        pass

    def get_not_available_schedule_blocks(self, user_id: int) -> list[UnavailableScheduleBlock]:
        pass
    
    def get_tasks(self, user_id: int, order_by_deadline_and_priority: bool) -> list[Task]:
        pass

    def create_task(self, user_id: int, data: Task) -> int:
        pass

    def update_task_status(self, user_id: int, task_id: int, new_status: str):
        pass
    
    def create_archive(self, user_id: int, name: str):
        pass
    
    def get_archives(self, user_id: int) -> list[Archive]:
        pass
    
    def create_file(self, user_id: int, archive_name: str, name: str):
        pass
    
    def update_file_content(self, user_id: int, archive_name: str, filename: str, new_content: str):
        pass
    
    def get_curricular_units(self, user_id: int) -> list[CurricularUnit]:
        pass
    
    def create_curricular_unit(self, user_id: int, name: str):
        pass
    
    def create_grade(self, user_id: int, curricular_unit: str, grade: Grade):
        pass