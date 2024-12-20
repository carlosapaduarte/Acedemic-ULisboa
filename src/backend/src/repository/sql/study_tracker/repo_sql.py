import random
from sqlmodel import Session, select

from domain.study_tracker import Archive, CurricularUnit, DailyEnergyStatus, Event, Grade, Priority, Task, UnavailableScheduleBlock, WeekAndYear, WeekTimeStudy
from exception import NotFoundException
from repository.sql.commons.repo_sql import CommonsSqlRepo
from repository.sql.models import database
from repository.sql.models.models import DailyEnergyStatusModel, DailyTagModel, STAppUseModel, STArchiveModel, STCurricularUnitModel, STFileModel, STGradeModel, STScheduleBlockNotAvailableModel, STEventModel, STEventTagModel, STTaskModel, STTaskTagModel, STWeekDayPlanningModel, UserModel, WeekStudyTimeModel
from datetime import datetime
from repository.sql.study_tracker.repo import StudyTrackerRepo
from utils import get_datetime_utc
from datetime import date

engine = database.get_engine()

class StudyTrackerSqlRepo(StudyTrackerRepo):    
    def update_user_study_tracker_use_goals(self, user_id: int, use_goals: set[int]):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)

            new_user_study_tracker_app_uses: list[STAppUseModel] = []
            for use_goal in use_goals:
                new_user_study_tracker_app_uses.append(
                    STAppUseModel(
                        id=use_goal,
                        user_id=user_id,
                        user=user_model
                    )
                )

            user_model.user_st_app_uses = new_user_study_tracker_app_uses
            session.add(user_model)
            session.commit()
            session.refresh(user_model)

    def update_study_tracker_app_planning_day(self, user_id: int, day: int, hour: int):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)

            user_model.st_planning_day = STWeekDayPlanningModel(
                week_planning_day=day,
                hour=hour,
                user_id=user_id,
                user=user_model
            )

            session.add(user_model)
            session.commit()
            session.refresh(user_model)

    def create_event(self, user_id: int, event: Event):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            
            # Generates a random ID, that is not yet taken
            random_generated_id: int = 0
            while True:
                random_generated_id: int = random.randint(1, database.POSTGRES_MAX_INTEGER_VALUE) # For some reason, automatic ID is not working
                statement = select(STEventModel).where(STEventModel.id == random_generated_id)
                result = session.exec(statement)
                if result.first() is None:
                    break

            new_event_model = STEventModel(
                id=random_generated_id, # For some reason, automatic ID is not working
                title=event.title,
                start_date=event.date.start_date,
                end_date=event.date.end_date,
                user_id=user_id,
                user=user_model,
                tags=[], # tags added next
                every_week=event.every_week
            )

            user_model.st_events.append(
                new_event_model
            )

            session.add(user_model)
            session.commit()
            session.refresh(new_event_model)

            tags_model: list[STEventTagModel] = []
            for tag in event.tags:
                tags_model.append(STEventTagModel(
                    user_id=user_id,
                    tag=tag,
                    event_id=new_event_model.id,
                    event=new_event_model
                ))

            for tag_model in tags_model:
                session.add(tag_model)
                session.commit()
                
    def update_event(self, user_id: int, event_id: int, event: Event):
        with Session(engine) as session:            
            statement = select(STEventModel)\
                .where(STEventModel.user_id == user_id)\
                .where(STEventModel.id == event_id)
                
            result = session.exec(statement)            
            event_model = result.first()
            
            if event_model == None:
                raise NotFoundException(user_id)
            
            event_model.title = event.title
            event_model.start_date = event.date.start_date
            event_model.end_date = event.date.end_date
            event_model.every_week = event.every_week
        
            session.add(event_model)
            session.commit()
            session.refresh(event_model)
            
            # First, delete all existent tags  
            for tag in event_model.tags:
                session.delete(tag)
            
            session.commit()

            # Now, add new ones
            tags_model: list[STEventTagModel] = []
            for tag in event.tags:
                tags_model.append(STEventTagModel(
                    user_id=user_id,
                    tag=tag,
                    event_id=event_model.id,
                    event=event_model
                ))

            for tag_model in tags_model:
                session.add(tag_model)
                session.commit()

    def delete_event(self, user_id: int, event_id: int):
        with Session(engine) as session:
            statement = select(STEventModel)\
                .where(STEventModel.user_id == user_id)\
                .where(STEventModel.id == event_id)
                
            result = session.exec(statement)            
            event_model = result.first()
            
            if event_model is None:
                raise NotFoundException(user_id)
            
            # First, delete all existent tags  
            for tag in event_model.tags:
                session.delete(tag)
                
            session.delete(event_model)
            session.commit()
        
    # Delete events with certain title    
    def delete_events(self, user_id: int, title: str):
        with Session(engine) as session:
            statement = select(STEventModel)\
                .where(STEventModel.user_id == user_id)\
                .where(STEventModel.title == title)
                
            print(title)
                
            result = session.exec(statement)            
            events_models = result.all()
            
            for event in events_models:
                StudyTrackerSqlRepo.delete_event(self, user_id, event.id)
            
            
    @staticmethod
    def is_today(date_1: datetime) -> bool:
        today = datetime.today()
        return date_1.year == today.year and date_1.month == today.month and date_1.day == today.day
    
    @staticmethod
    def is_study_event(event: STEventModel) -> bool:
        for tag in event.tags:
            if tag.tag == "study" or tag.tag == "Study":
                #print(tag)
                return True
        return False
    
    def get_events(
        self, 
        user_id: int, 
        filter_today: bool, 
        recurrentEvents: bool, 
        study_events: bool, 
        week_number: int | None
    ) -> list[Event]:
        with Session(engine) as session:
            statement = select(STEventModel)\
                .where(STEventModel.user_id == user_id)\
                    
            if recurrentEvents:
                statement = statement.where(STEventModel.every_week == True)
                
            results = session.exec(statement)
            
            # Ideally, we would use another where statement. Yet, this was not working for me...
            events: list[STEventModel] = []
            for event in results:
                if (not filter_today or StudyTrackerSqlRepo.is_today(event.start_date)):
                    #print('From DB: ', event.start_date.timestamp())
                    events.append(event)
                                

            # Filter events that has tag "study"
            if study_events:    
                events_filtered: list[STEventModel] = []
                for event in events:
                    if StudyTrackerSqlRepo.is_study_event(event):
                        events_filtered.append(event)                
                events = events_filtered
                
            if week_number is not None:
                events_filtered: list[STEventModel] = []
                for event in events:
                    if event.start_date.isocalendar().week is week_number:
                        events_filtered.append(event)                
                events = events_filtered
            
            return Event.from_STEventModel(events)
        
    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            user_model.receive_st_app_notifications = receive            

            session.add(user_model)
            session.commit()

    def create_not_available_schedule_block(self, user_id: int, info: UnavailableScheduleBlock):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            user_model.schedule_unavailable_blocks.append(STScheduleBlockNotAvailableModel(
                week_day=info.week_day,
                start_hour=info.start_hour,
                duration=info.duration,
                user_id=user_id
            ))

            session.add(user_model)
            session.commit()

    def get_not_available_schedule_blocks(self, user_id: int) -> list[UnavailableScheduleBlock]:
         with Session(engine) as session:
            statement = select(STScheduleBlockNotAvailableModel).where(STScheduleBlockNotAvailableModel.user_id == user_id)
            results = session.exec(statement)
        
            blocks: list[UnavailableScheduleBlock] = []
            for block_model in results:
                blocks.append(UnavailableScheduleBlock(
                    week_day=block_model.week_day,
                    start_hour=block_model.start_hour,
                    duration=block_model.duration
                ))
            return blocks
    
    @staticmethod
    def build_task(task_model: STTaskModel) -> Task:
        
        # Build Task Sub-Tasks
        subtasks: list[Task] = []
        for sub_task_model in task_model.subtasks:
            subtasks.append(StudyTrackerSqlRepo.build_task(sub_task_model))
        
        # Build Task Tags
        tags: list[str] = []
        for tag_model in task_model.tags:
            tags.append(tag_model.tag)
            
        return Task(
            id=task_model.id,
            title=task_model.title,
            description=task_model.description,
            deadline=task_model.deadline,
            priority=task_model.priority,
            tags=tags,
            status=task_model.status,
            sub_tasks=subtasks
        )
    
    """
    @staticmethod
    def is_task_or_son_completed(task: STTaskModel):
        # Returns True if task is completed or one of it's sons is completed
        
        if (task.status == "completed"):
            return True
        
        for task in task.subtasks:
            if StudyTrackerSqlRepo.is_task_or_son_completed(task):
                return True

        return False
        """
        
            
    def get_tasks(
        self, 
        user_id: int, 
        order_by_deadline_and_priority: bool, 
        filter_uncompleted_tasks: bool, 
        filter_deadline_is_today: bool,
        year: int | None,
        week: int | None
    ) -> list[Task]:
        
        with Session(engine) as session:
            statement = select(STTaskModel)\
                .where(STTaskModel.user_id == user_id)\
                .where(STTaskModel.parent_task_id == None)\
                
            if filter_uncompleted_tasks:
                statement = statement\
                    .where(STTaskModel.status == "completed")

            result = session.exec(statement)
            
            task_models: list[STTaskModel] = list(result.all())
            
            """
            if filter_uncompleted_tasks:
                for task_model in task_models:
                    if not StudyTrackerSqlRepo.is_task_or_son_completed(task_model):
                        task_models.remove(task_model)
            """
            
            # Retrieve Tasks
            tasks: list[Task] = []
            for task_model in task_models:
                tasks.append(StudyTrackerSqlRepo.build_task(task_model))
            
            tasks.sort(key=lambda task: task.id if task.id is not None else 0)
            
            # TODO: do this using SQL Model!
            # Right now, he is just sorting based on the task.deadline plus the priority string size
            if order_by_deadline_and_priority:
                tasks.sort(key=lambda task: task.deadline if task.deadline is not None else datetime.max)
                tasks.sort(key=lambda task: Priority.from_str(task.priority).value, reverse=True)
                
            # Ideally, we would use another where statement. Yet, this was not working for me...
            if filter_deadline_is_today:
                for task in tasks:
                    if task.deadline is not None and not StudyTrackerSqlRepo.is_today(task.deadline):
                        tasks.remove(task)
                        
            if year:
                for task in tasks:
                    if task.deadline is not None and task.deadline.year != year:
                        tasks.remove(task)
                    
            if week:
                for task in tasks:
                    if task.deadline is not None and task.deadline.isocalendar().week != week:
                        tasks.remove(task)
                        
            return tasks
        
    
    @staticmethod
    def create_task_with_parent(
        task: Task, 
        task_id: int | None,
        user_id: int, 
        user_model: UserModel, 
        parent_task_id: int | None, 
        session: Session
    ) -> int:
        
        # Generates a random ID, that is not yet taken
        if task_id is None:
            while True:
                task_id = random.randint(1, database.POSTGRES_MAX_INTEGER_VALUE) # For some reason, automatic ID is not working
                statement = select(STTaskModel).where(STTaskModel.id == task_id)
                result = session.exec(statement)
                if result.first() is None:
                    break
        
        new_task_model = STTaskModel(
            id=task_id, # For some reason, automatic ID is not working
            title=task.title,
            description=task.description,
            deadline=task.deadline,
            priority=task.priority,
            status=task.status,
            user_id=user_id,
            user=user_model,
            tags=[], # tags added next
            subtasks=[],
            parent_task_id=parent_task_id,
            parent_user_id=user_id
        )
        
        session.add(new_task_model)
        session.commit()
        session.refresh(new_task_model)
        
        # Create associated tags
        tags_model: list[STTaskTagModel] = []
        for tag in task.tags:
            tags_model.append(STTaskTagModel(
                tag=tag,
                task_id=new_task_model.id,
                task=new_task_model,
                user_id=user_id
            ))

        for tag_model in tags_model:
            session.add(tag_model)
            session.commit()
            
        # Create associated sub-tags
        for sub_task in task.sub_tasks:
            StudyTrackerSqlRepo.create_task_with_parent(
                sub_task, 
                None,
                user_id, 
                user_model, 
                parent_task_id=new_task_model.id, 
                session=session
            )
            
        return new_task_model.id
         
    def create_task(self, user_id: int, task: Task, task_id: int | None) -> int:
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            
            # Create parent Task
            return StudyTrackerSqlRepo.create_task_with_parent(task, task_id, user_id, user_model, parent_task_id=None, session=session)
        
    def update_task(self, user_id: int, task_id: int, task: Task):
        with Session(engine) as session:
            
            statement = select(STTaskTagModel)\
                .where(STTaskTagModel.user_id == user_id)\
                .where(STTaskTagModel.task_id == task_id)
                
            result = session.exec(statement)
            child_tasks_models = result.all()
            
            # Delete existent tags
            for tag in child_tasks_models:
                session.delete(tag)
            session.commit()
            
            statement = select(STTaskModel)\
                .where(STTaskModel.user_id == user_id)\
                .where(STTaskModel.id == task_id)
            
            result = session.exec(statement)
            task_model: STTaskModel = result.one()
            
            # Delete existent task
            session.delete(task_model)
            session.commit()
            
            statement = select(STTaskModel)\
                .where(STTaskModel.user_id == user_id)\
                .where(STTaskModel.parent_task_id == task_id)
            
            result = session.exec(statement)
            child_tasks_models = result.all()
            
            # Delete child tasks
            for child in child_tasks_models:
                session.delete(child)
            session.commit()
            
            StudyTrackerSqlRepo.create_task(self, user_id, task, task_id)

    def update_task_status(self, user_id: int, task_id: int, new_status: str):
        with Session(engine) as session:
            statement = select(STTaskModel).where(STTaskModel.user_id == user_id).where(STTaskModel.id == task_id)
            result = session.exec(statement)
            
            task_model: STTaskModel = result.one()
            task_model.status = new_status

            session.add(task_model)
            session.commit()
            
    def create_archive(self, user_id: int, name: str):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            user_model.st_archives.append(STArchiveModel(
                name=name,
                user_id=user_id
            ))

            session.add(user_model)
            session.commit()
            
    def get_archives(self, user_id: int) -> list[Archive]:
        with Session(engine) as session:
            statement = select(STArchiveModel)\
                .where(STArchiveModel.user_id == user_id)
            result = session.exec(statement)
            
            archive_models: list[STArchiveModel] = list(result.all())
            
            return Archive.from_STArchiveModel(archive_models)
        
    def create_file(self, user_id: int, archive_name: str, name: str):
        with Session(engine) as session:
            statement = select(STArchiveModel)\
                .where(STArchiveModel.user_id == user_id)\
                .where(STArchiveModel.name == archive_name)
            result = session.exec(statement)

            archive_model = result.one()            
            archive_model.files.append(STFileModel(
                name=name,
                text="",
                archive_name=archive_name,
                user_id=user_id
            ))

            session.add(archive_model)
            session.commit()
            
    def update_file_content(self, user_id: int, archive_name: str, filename: str, new_content: str):
        with Session(engine) as session:
            statement = select(STFileModel)\
                .where(STFileModel.user_id == user_id)\
                .where(STFileModel.archive_name == archive_name)\
                .where(STFileModel.name == filename)
                
            result = session.exec(statement)
            
            file_model: STFileModel = result.one()
            file_model.text = new_content
            session.add(file_model)
            session.commit()
            session.refresh(file_model)
            
    def get_curricular_units(self, user_id: int) -> list[CurricularUnit]:
        with Session(engine) as session:
            statement = select(STCurricularUnitModel)\
                .where(STCurricularUnitModel.user_id == user_id)
            result = session.exec(statement)
            
            cu_models: list[STCurricularUnitModel] = list(result.all())
            
            return CurricularUnit.from_STCurricularUnitModel(cu_models)
        
    def create_curricular_unit(self, user_id: int, name: str):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(user_id, session)
            user_model.st_curricular_units.append(STCurricularUnitModel(
                user_id=user_id,
                name=name,
                grades=[]
            ))
            session.add(user_model)
            session.commit()
            
    def create_grade(self, user_id: int, curricular_unit: str, grade: Grade):
        with Session(engine) as session:
            statement = select(STCurricularUnitModel)\
                .where(STCurricularUnitModel.user_id == user_id)\
                .where(STCurricularUnitModel.name == curricular_unit)
            
            result = session.exec(statement)
            
            curricular_unit_model: STCurricularUnitModel = result.one()
            curricular_unit_model.grades.append(STGradeModel(
                id=random.randint(1, 999999999), # For some reason, automatic ID is not working
                value=grade.value,
                weight=grade.weight,
                curricular_unit_name=curricular_unit,
                user_id=user_id
            ))
            
            session.add(curricular_unit_model)
            session.commit()
            
    def create_or_override_daily_energy_status(self, user_id: int, status: DailyEnergyStatus):
        with Session(engine) as session:
            
            statement = select(DailyEnergyStatusModel)\
                .where(DailyEnergyStatusModel.user_id == user_id)\
                .where(DailyEnergyStatusModel.date_ == status.date_) # Not working!
                
            result = session.exec(statement)
            model: DailyEnergyStatusModel | None = result.first()
            
            if model is None:            
                daily_energy_stat = DailyEnergyStatusModel(
                    date_=status.date_,
                    time_of_day=status.time_of_day,
                    level=status.level,
                    user_id=user_id
                )
                
                session.add(daily_energy_stat)
            else:
                model.level = status.level
                model.time_of_day = status.time_of_day
                session.add(model)
            
            session.commit()
            
    @staticmethod
    def is_same_day(date_1: date, date_2: date) -> bool:
        return date_1.year == date_2.year and date_1.month == date_2.month and date_1.day == date_2.day
    
    def create_daily_tags(self, user_id: int, tags: list[str], _date: date):
        with Session(engine) as session:
            
            for tag in tags:
                statement = select(DailyTagModel)\
                    .where(DailyTagModel.user_id == user_id)\
                    .where(DailyTagModel.tag == tag)
                    # checking date doesn't work... Check later
                    
                result = session.exec(statement)
                res = result.first()
                
                if res is not None:
                    if StudyTrackerSqlRepo.is_same_day(res.date_, _date):
                        continue
                
                daily_energy_stat = DailyTagModel(
                    date_=_date,
                    tag=tag,
                    user_id=user_id
                )        
                session.add(daily_energy_stat)            
            
            session.commit()        
            
    def get_daily_tags(self, user_id: int, _date: date) -> list[str]:
        with Session(engine) as session:
            statement = select(DailyTagModel)\
                .where(DailyTagModel.user_id == user_id)
                
            result = session.exec(statement)
            daily_tags_models: list[DailyTagModel] = list(result.all())
            
            daily_tags: list[str] = []
            for tag_model in daily_tags_models:
                if StudyTrackerSqlRepo.is_same_day(tag_model.date_, _date):
                    daily_tags.append(tag_model.tag)
                
            return daily_tags
            
    def is_today_energy_status_created(self, user_id: int) -> bool:
        today = date.today()
        with Session(engine) as session:
            statement = select(DailyEnergyStatusModel)\
                .where(DailyEnergyStatusModel.user_id == user_id)\
                .where(DailyEnergyStatusModel.date_ == today) # Not working!
                
            result = session.exec(statement)
            model: DailyEnergyStatusModel | None = result.first()
            return model is not None
            
    def get_daily_energy_history(self, user_id: int) -> list[DailyEnergyStatus]:
        with Session(engine) as session:
            statement = select(DailyEnergyStatusModel)\
                .where(DailyEnergyStatusModel.user_id == user_id)
                
            result = session.exec(statement)
            daily_energy_history_models: list[DailyEnergyStatusModel] = list(result.all())
            
            daily_energy_history: list[DailyEnergyStatus] = []
            for stat_model in daily_energy_history_models:
                daily_energy_history.append(
                    DailyEnergyStatus(
                        date=stat_model.date_,
                        time_of_day=stat_model.time_of_day,
                        level=stat_model.level
                    )
                )
                
            return daily_energy_history
            
            
    @staticmethod
    def compute_elapsed_minutes(date1: datetime, date2: datetime) -> int:
        return (int) ((get_datetime_utc(date1) - get_datetime_utc(date2)) / 60)
            
    def get_time_spent_by_tag(self, user_id: int) -> dict[int, dict[int, dict[str, int]]]:
        # TODO: events that repeat every week
        
        with Session(engine) as session:
            statement = select(STEventModel)\
                .where(STEventModel.user_id == user_id)
            
            result = session.exec(statement)
            events: list[STEventModel] = list(result.all())
            
            stats: dict[int, dict[int, dict[str, int]]] = {}

            for event in events:
                start_date = event.start_date
                elapsed_minutes = StudyTrackerSqlRepo.compute_elapsed_minutes(event.end_date, start_date)
                
                year = start_date.year
                week = event.start_date.isocalendar().week
                            
                tags = event.tags
                for tag in tags:
                    tag_name = tag.tag
                    
                    if stats.get(year) is None:
                        stats[year] = {}
                        
                    if stats[year].get(week) is None:
                        stats[year][week] = {}
                        
                    if stats[year][week].get(tag_name) is None:
                        stats[year][week][tag_name] = 0
                        
                    stats[year][week][tag_name] += elapsed_minutes
                    
            return stats
        
    def get_total_time_study_per_week(self, user_id: int) -> list[WeekTimeStudy]:
        with Session(engine) as session:
            statement = select(WeekStudyTimeModel)\
                .where(WeekStudyTimeModel.user_id == user_id)\
                    
            result = session.exec(statement)
            week_study_time_history: list[WeekStudyTimeModel] = list(result.all())
            return WeekTimeStudy.from_STCurricularUnitModel(week_study_time_history)
            
            
    
    def increment_week_study_time(self, user_id: int, week_and_year: WeekAndYear, minutes: int):
        with Session(engine) as session:
            statement = select(WeekStudyTimeModel)\
                .where(WeekStudyTimeModel.user_id == user_id)\
                .where(WeekStudyTimeModel.year == week_and_year.year)\
                .where(WeekStudyTimeModel.week == week_and_year.week)
                    
            result = session.exec(statement)
            week_study_time_model: WeekStudyTimeModel | None = result.first()
            
            if week_study_time_model is None:
                new_model = WeekStudyTimeModel(
                    year=week_and_year.year,
                    week=week_and_year.week,
                    total=minutes,
                    average_by_session=0,
                    n_of_sessions=0,
                    user_id=user_id
                )
                session.add(new_model)
                session.commit()
            else:
                week_study_time_model.total += minutes
                session.add(week_study_time_model)
                session.commit()
                
    def override_study_session_start_date(self, user_id: int):
        with Session(engine) as session:
            statement = select(UserModel)\
                .where(UserModel.id == user_id)
                    
            result = session.exec(statement)
            user_model: UserModel | None = result.first()            
            
            if user_model is None:
                raise NotFoundException(user_id)
            
            user_model.study_session_time = datetime.now()
            
            session.add(user_model)
            session.commit()
            
    def get_study_session_start_date(self, user_id: int) -> datetime:
        with Session(engine) as session:
            statement = select(UserModel)\
                .where(UserModel.id == user_id)
                    
            result = session.exec(statement)
            user_model: UserModel | None = result.first()            
            
            if user_model is None:
                raise NotFoundException(user_id)
            
            start = user_model.study_session_time
            if start is None:
                raise NotFoundException(user_id)
            return start
            
    def update_week_time_average_study_time(self, user_id: int, week_and_year: WeekAndYear, study_session_time: int):
        with Session(engine) as session:
            statement = select(WeekStudyTimeModel)\
                .where(WeekStudyTimeModel.user_id == user_id)\
                .where(WeekStudyTimeModel.year == week_and_year.year)\
                .where(WeekStudyTimeModel.week == week_and_year.week)
                    
            result = session.exec(statement)
            week_study_time_model: WeekStudyTimeModel | None = result.first()
            
            if week_study_time_model is None:
                raise # TODO!
            else:
                if week_study_time_model.average_by_session is 0:
                    new_average = study_session_time    
                else:
                    new_average = ((week_study_time_model.average_by_session * week_study_time_model.n_of_sessions) + study_session_time) / (week_study_time_model.n_of_sessions + 1)
                    new_average = round(new_average, 1)
                
                week_study_time_model.average_by_session = new_average
                week_study_time_model.n_of_sessions += 1
                session.add(week_study_time_model)
                session.commit()