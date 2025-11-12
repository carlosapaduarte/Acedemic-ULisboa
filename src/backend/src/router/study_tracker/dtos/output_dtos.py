from typing import Optional
from pydantic import BaseModel

from domain.study_tracker import Archive, CurricularUnit, DailyEnergyStatus, Event, File, Grade, Task, WeekTimeStudy
from utils import get_datetime_utc, get_datetime_utc_from_date
from datetime import date

class DailyTasksProgressOutputDto(BaseModel):
    date_: int
    progress: float
    
    @staticmethod
    def from_domain(domain: list[tuple[date, float]]) -> list['DailyTasksProgressOutputDto']:
        progress_by_day: list['DailyTasksProgressOutputDto'] = []
        for (task_date, progress) in domain:
            progress_by_day.append(
                DailyTasksProgressOutputDto(
                    date_=get_datetime_utc_from_date(task_date),
                    progress=progress
                )
            )
        return progress_by_day

class UserTaskOutputDto(BaseModel):
    id: int
    title: str
    description: str
    deadline: float | None
    priority: str
    tags: list[str]
    status: str
    is_micro_task: bool
    subTasks: list['UserTaskOutputDto']
    
    @staticmethod
    def from_Tasks(tasks: list[Task]) -> list['UserTaskOutputDto']:
        task_dtos: list['UserTaskOutputDto'] = []
        for task in tasks:
            task_dtos.append(UserTaskOutputDto.from_Task(task))
        return task_dtos
        
    @staticmethod
    def from_Task(task: Task) -> 'UserTaskOutputDto':
        task_id = task.id
        if task_id is None:
            raise

        sub_tasks_output_dto: list[UserTaskOutputDto] = []
        for sub_task in task.sub_tasks:
            sub_tasks_output_dto.append(UserTaskOutputDto.from_Task(sub_task))
            
        return UserTaskOutputDto(
            id=task_id,
            title=task.title,
            description=task.description,
            deadline=get_datetime_utc(task.deadline) if task.deadline is not None else None,
            priority=task.priority,
            tags=task.tags,
            status=task.status,
            is_micro_task=task.is_micro_task,
            subTasks=sub_tasks_output_dto
        )

class EventOutputDto(BaseModel):
    id: int
    startDate: int
    endDate: int
    title: str
    tags: list[str]
    everyWeek: bool
    everyDay: bool
    color: str | None = None
    notes: str | None = None


    @staticmethod
    def from_events(events: list[Event]) -> list['EventOutputDto']:
        output_dtos_events: list[EventOutputDto] = []
        for event in events:
            event_id = event.id
            if event_id is None:
                raise
        
            output_dtos_events.append(
                EventOutputDto(
                    id=event_id,
                    startDate=get_datetime_utc(event.date.start_date),
                    endDate=get_datetime_utc(event.date.end_date),
                    title=event.title,
                    tags=event.tags,
                    everyWeek=event.every_week,
                    everyDay=event.every_day,
                    color=event.color,
                    notes=event.notes
                )
            )

        return output_dtos_events
    
class FileOutputDto(BaseModel):
    name: str
    text: str
    
    @staticmethod
    def from_files(files: list[File]) -> list['FileOutputDto']:
        file_output_dtos: list['FileOutputDto'] = []
        
        for file in files:
            file_output_dtos.append(FileOutputDto(
                name=file.name,
                text=file.text
            ))
            
        return file_output_dtos
    
class ArchiveOutputDto(BaseModel):
    name: str
    files: list[FileOutputDto]
    
    @staticmethod
    def from_archives(archives: list[Archive]) -> list['ArchiveOutputDto']:
        archive_output_dtos: list['ArchiveOutputDto'] = []
        
        for archive in archives:
            archive_output_dtos.append(ArchiveOutputDto(
                name=archive.name,
                files=FileOutputDto.from_files(archive.files)
            ))
            
        return archive_output_dtos
    
class GradeOutputDto(BaseModel):
    id: int
    value: float
    weight: float
    
    @staticmethod
    def from_grades(grades: list[Grade]) -> list['GradeOutputDto']:
        grade_output_dtos: list['GradeOutputDto'] = []
        
        for grade in grades:
            grade_output_dtos.append(GradeOutputDto(
                id=grade.id,
                value=grade.value,
                weight=grade.weight
            ))
            
        return grade_output_dtos
    
class CurricularUnitOutputDto(BaseModel):
    name: str
    grades: list[GradeOutputDto]
    
    @staticmethod
    def from_curricular_units(curricular_units: list[CurricularUnit]) -> list['CurricularUnitOutputDto']:
        cu_output_dtos: list['CurricularUnitOutputDto'] = []
        
        for cu in curricular_units:
            cu_output_dtos.append(CurricularUnitOutputDto(
                name=cu.name,
                grades=GradeOutputDto.from_grades(cu.grades)
            ))
            
        return cu_output_dtos
    
class DailyEnergyStatusOutputDto(BaseModel):
    date: float
    timeOfDay: str
    level: int
    
    @staticmethod
    def from_domain(daily_energy_status_history: list[DailyEnergyStatus]) -> list["DailyEnergyStatusOutputDto"]:
        dtos: list[DailyEnergyStatusOutputDto] = []
        for status in daily_energy_status_history:
            dtos.append(
                DailyEnergyStatusOutputDto(
                    date=get_datetime_utc_from_date(status.date_),
                    timeOfDay=status.time_of_day,
                    level=status.level
                )
            )
        return dtos
    
class WeekTimeStudyOutputDto(BaseModel):
    year: int
    week: int
    total: int
    averageBySession: float
    target: float | None
    
    @staticmethod
    def from_domain(domain: list[WeekTimeStudy]) -> list["WeekTimeStudyOutputDto"]:
        dtos: list[WeekTimeStudyOutputDto] = []
        for record in domain:
            dtos.append(
                WeekTimeStudyOutputDto(
                    year=record.week_and_year.year,
                    week=record.week_and_year.week,    
                    total=record.total,
                    averageBySession=record.average_by_session,
                    target=record.target
                )
            )
        return dtos
    
class TagOutputDto(BaseModel):
    id: int
    name_pt: Optional[str] = None
    name_en: Optional[str] = None
    color: str