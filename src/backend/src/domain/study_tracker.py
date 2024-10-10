from datetime import datetime
from enum import Enum

from repository.sql.models.models import STArchiveModel, STCurricularUnitModel, STEventModel, STFileModel, STGradeModel
from router.study_tracker.dtos.input_dtos import CreateTaskInputDto, SlotToWorkInputDto

class Priority(Enum):
    URGENTE = 1
    IMPORTANTE = 2

    @staticmethod
    def from_str(priority: str) -> 'Priority':
        if priority == "importante":
            return Priority.IMPORTANTE
        if priority == "urgente":
            return Priority.URGENTE
        raise

class SlotToWork():
    def __init__(
        self,
        start_time: datetime,
        end_time: datetime
    ) -> None:
        self.start_time = start_time
        self.end_time = end_time

    @staticmethod
    def from_slot_to_work_input_dto(slots_dto: list[SlotToWorkInputDto]) -> 'list[SlotToWork]':
        slots: list[SlotToWork] = []
        for slot_dto in slots_dto:
            slots.append(SlotToWork(
                start_time=datetime.fromtimestamp(slot_dto.startTime),
                end_time=datetime.fromtimestamp(slot_dto.endTime)
            ))
        return slots

class Task():
    def __init__(
            self,
            id: int | None,
            title: str,
            description: str,
            deadline: datetime,
            priority: str,
            tags: list[str],
            sub_tasks: list['Task'],
            status: str="Tarefa não iniciada", # Default value
    ) -> None:
        self.id=id
        self.title=title
        self.description=description
        self.deadline=deadline
        self.priority=priority
        self.tags=tags
        self.sub_tasks=sub_tasks
        self.status=status

    @staticmethod
    def from_create_task_input_dto(task_dto: CreateTaskInputDto) -> 'Task':
        sub_tasks: list['Task'] = []
        for sub_task in task_dto.subTasks:
            sub_tasks.append(Task.from_create_task_input_dto(sub_task))
        return Task(
            id=None,
            title=task_dto.title,
            description=task_dto.description,
            deadline=datetime.fromtimestamp(task_dto.deadline),
            priority=task_dto.priority,
            tags=task_dto.tags,
            status=task_dto.status,
            sub_tasks=sub_tasks
        )

class UnavailableScheduleBlock():
    def __init__(self, week_day: int, start_hour: int, duration: int):
        self.week_day=week_day
        self.start_hour=start_hour
        self.duration=duration

class DateInterval():
    def __init__(self, start_date: datetime, end_date: datetime):
         self.start_date=start_date
         self.end_date=end_date

    def collides_with_unavailable_block(self, block: UnavailableScheduleBlock):
        block_start_hour = block.start_hour
        block_end_hour = block.start_hour + block.duration
        event_start_hour = self.start_date.time().hour
        event_end_hour = self.end_date.time().hour

        if event_start_hour < block_start_hour:
            if event_end_hour <= block_start_hour:
                return False
            return True
        if  event_start_hour == block_start_hour:
            return True
        if event_start_hour > block_start_hour and event_start_hour < block_end_hour:
            return True

        return False

"""
class ScheduleBlock():
    def __init__(self, title: str, date: DateInterval):
        self.title=title
        self.date=date
        
    @staticmethod
    def fromCreateScheduleBlockInputDto(dto: CreateScheduleBlockInputDto) -> 'ScheduleBlock':
        return ScheduleBlock(
            title=dto.title,
            date=DateInterval(
                start_date=datetime.fromtimestamp(dto.startDate),
                end_date=datetime.fromtimestamp(dto.endDate)
            )
        )
"""

class Event():
    def __init__(self, title: str, date: DateInterval, tags: list[str], every_week: bool):
        self.title=title
        self.date=date
        self.tags=tags
        self.every_week=every_week

    @staticmethod
    def from_STEventModel(events: list[STEventModel]) -> list['Event']:
        today_events: list[Event] = []
        for event_result in events:

            # Obtain Tags first
            tags: list[str] = []
            for tag_model in event_result.tags:
                tags.append(tag_model.tag)

            today_events.append(
                Event(
                    title=event_result.title,
                    date=DateInterval(
                        start_date=event_result.start_date,
                        end_date=event_result.end_date
                    ),
                    tags=tags,
                    every_week=event_result.every_week
                )
            )
        return today_events

class File():
    def __init__(self, name: str, text: str):
        self.name=name
        self.text=text

    @staticmethod
    def from_STFileModel(file_models: list[STFileModel]) -> list['File']:
        files: list[File] = []
        for file_model in file_models:
            files.append(File(
                name=file_model.name,
                text=file_model.text
            ))

        return files

class Archive():
    def __init__(self, name: str, files: list[File]):
        self.name=name
        self.files=files

    @staticmethod
    def from_STArchiveModel(archive_models: list[STArchiveModel]) -> list['Archive']:
        archives: list[Archive] = []
        for archive_model in archive_models:
            archives.append(Archive(
                name=archive_model.name,
                files=File.from_STFileModel(archive_model.files)
            ))

        return archives

class Grade():
    value: float
    weight: float

    def __init__(self, value: float, weight: float) -> None:
        self.value=value
        self.weight=weight

    @staticmethod
    def from_STGradeModel(grade_models: list[STGradeModel]) -> list['Grade']:
        grades: list[Grade] = []
        for grade_model in grade_models:
            grades.append(Grade(
                value=grade_model.value,
                weight=grade_model.weight
            ))

        return grades

class CurricularUnit():
    name: str
    grades: list[Grade]

    def __init__(self, name: str, grades: list[Grade]) -> None:
        self.name=name
        self.grades=grades

    @staticmethod
    def from_STCurricularUnitModel(cu_models: list[STCurricularUnitModel]) -> list['CurricularUnit']:
        curricular_units: list[CurricularUnit] = []
        for cu_model in cu_models:
            curricular_units.append(CurricularUnit(
                name=cu_model.name,
                grades=Grade.from_STGradeModel(cu_model.grades)
            ))

        return curricular_units