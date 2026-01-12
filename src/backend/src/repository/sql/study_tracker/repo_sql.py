import random
from sqlmodel import Session, select, or_
from domain.study_tracker import Archive, CurricularUnit, DailyEnergyStatus, Event, Grade, Priority, Task, UnavailableScheduleBlock, WeekAndYear, WeekTimeStudy, SlotToWork, DateInterval
from exception import NotFoundException
from repository.sql.commons.repo_sql import CommonsSqlRepo
from repository.sql.models import database
from repository.sql.models.models import STMoodLogModel, DailyTagModel, STAppUseModel, STArchiveModel, STCurricularUnitModel, STFileModel, STGradeModel, STScheduleBlockNotAvailableModel, STEventModel, STEventTagModel, STTaskModel, STTaskTagModel, STWeekDayPlanningModel, TagModel, UserModel, UserTagLink, WeekStudyTimeModel
from datetime import datetime, date, timezone
from repository.sql.study_tracker.repo import StudyTrackerRepo
from sqlalchemy.orm import selectinload
from utils import get_datetime_utc


engine = database.get_engine()

class StudyTrackerSqlRepo(StudyTrackerRepo):    
    def update_user_study_tracker_use_goals(self, user_id: int, use_goals: set[int]):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)
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
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)
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
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)

            # Generates a random ID, that is not yet taken
            random_generated_id: int = 0
            while True:
                random_generated_id: int = random.randint(1, database.POSTGRES_MAX_INTEGER_VALUE)
                statement = select(STEventModel).where(STEventModel.id == random_generated_id)
                result = session.exec(statement)
                if result.first() is None:
                    break
            rec_start_dt = event.recurrence_start
            rec_end_dt = event.recurrence_end
            new_event_model = STEventModel(
                id=random_generated_id,
                title=event.title,
                start_date=event.date.start_date,
                end_date=event.date.end_date,
                user_id=user_id,
                user=user_model,
                every_week=event.every_week,
                every_day=event.every_day,
                notes=event.notes,
                color=event.color,
                task_id=event.task_id,
                task_user_id=user_id if event.task_id else None,
                is_uc=event.is_uc,
                recurrence_start=rec_start_dt,
                recurrence_end=rec_end_dt
            )

            session.add(new_event_model)
            session.flush()
            
            for tag_input_value in event.tags:
                tag_model = None
                    
                try:
                    tag_id_from_input = int(tag_input_value)
                    tag_model = self.get_tag_by_id(session, tag_id_from_input)
                    if tag_model is None:
                        tag_model = self.get_tag_by_name(session, str(tag_input_value).lower())

                except ValueError:
                    tag_model = self.get_tag_by_name(session, str(tag_input_value).lower())

                if tag_model is None:
                    new_tag_name = str(tag_input_value).lower()
                    new_tag_model = self.create_tag(session, new_tag_name)
                    tag_model = new_tag_model
                    
                #Cria a associação
                if tag_model:
                    association = STEventTagModel(
                        user_id=user_id,
                        tag_id=tag_model.id,
                        event_id=new_event_model.id
                    )
                    session.add(association)
                    
                    #UserTagLink já existe para este user e esta tag?
                    existing_user_tag_link = session.exec(
                        select(UserTagLink).where(
                            UserTagLink.user_id == user_id,
                            UserTagLink.tag_id == tag_model.id
                        )
                    ).first()
                    
                    #Se o link não existe, cria
                    if not existing_user_tag_link:
                        new_user_tag_link = UserTagLink(user_id=user_id, tag_id=tag_model.id)
                        session.add(new_user_tag_link)

            session.commit()
            session.refresh(new_event_model)
            
        return new_event_model

    def update_event(self, user_id: int, event_id: int, event: Event):
        with Session(engine) as session:
            statement = select(STEventModel).where(STEventModel.id == event_id, STEventModel.user_id == user_id)
            event_model = session.exec(statement).first()
            if not event_model:
                return 
            event_model.title = event.title
            event_model.start_date = event.date.start_date
            event_model.end_date = event.date.end_date
            event_model.every_week = event.every_week
            event_model.every_day = event.every_day
            event_model.notes = event.notes
            event_model.color = event.color
            event_model.is_uc = event.is_uc
            
            event_model.recurrence_start = event.recurrence_start
            event_model.recurrence_end = event.recurrence_end

            event_model.tags_associations.clear()
            
            # 2. Adicionar as novas tags
            for tag_input_value in event.tags:
                tag_model = None
                try:
                    tag_id_from_input = int(tag_input_value)
                    tag_model = self.get_tag_by_id(session, tag_id_from_input)
                    if tag_model is None:
                        tag_model = self.get_tag_by_name(session, str(tag_input_value).lower())
                except ValueError:
                    tag_model = self.get_tag_by_name(session, str(tag_input_value).lower())

                if tag_model is None:
                    new_tag_name = str(tag_input_value).lower()
                    new_tag_model = self.create_tag(session, new_tag_name)
                    tag_model = new_tag_model
                    
                if tag_model:
                    association = STEventTagModel(
                        user_id=user_id,
                        tag_id=tag_model.id
                    )
                    event_model.tags_associations.append(association)
                    
                    # Verificar/Criar UserTagLink (para estatísticas)
                    existing_user_tag_link = session.exec(
                        select(UserTagLink).where(
                            UserTagLink.user_id == user_id,
                            UserTagLink.tag_id == tag_model.id
                        )
                    ).first()
                    
                    if not existing_user_tag_link:
                        new_user_tag_link = UserTagLink(user_id=user_id, tag_id=tag_model.id)
                        session.add(new_user_tag_link)

            session.add(event_model)
            session.commit()
            session.refresh(event_model)
            
    def delete_event(self, user_id: int, event_id: int):
        with Session(engine) as session:
            statement = select(STEventModel)\
                .where(STEventModel.user_id == user_id)\
                .where(STEventModel.id == event_id) 
            result = session.exec(statement)            
            event_model = result.first()
            if event_model is None:
                raise NotFoundException(event_id)
            
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
    
    def get_tag_by_name(self, session: Session, tag_name: str) -> TagModel | None:
        """Busca uma tag pelo nome (CASE INSENSITIVE)."""
        statement = select(TagModel).where( or_(TagModel.name_pt.ilike(tag_name),TagModel.name_en.ilike(tag_name)))
        tag = session.scalars(statement).first()
        return tag
    
    def get_tag_by_id(self, session: Session, tag_id: int) -> TagModel | None:
        """Busca uma tag pelo ID."""
        statement = select(TagModel).where(TagModel.id == tag_id)
        return session.exec(statement).first()
    
    def create_tag(self, session: Session, tag_name: str) -> TagModel:
        """Cria uma nova tag com o nome dado."""
        new_tag = TagModel(name=tag_name)
        session.add(new_tag)
        session.flush()
        session.refresh(new_tag)
        return new_tag
    
    @staticmethod
    def is_today(date_1: datetime) -> bool:
        today = datetime.today()
        return date_1.year == today.year and date_1.month == today.month and date_1.day == today.day
    
    @staticmethod
    def is_study_event(event: STEventModel) -> bool:
        for tag in event.tags:
            if (tag.name_pt and tag.name_pt.lower() == "study") or (tag.name_en and tag.name_en.lower() == "study"):
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
            statement = (
                select(STEventModel)
                .where(STEventModel.user_id == user_id)
                .options(
                    selectinload(STEventModel.tags_associations).selectinload(STEventTagModel.tag_ref)
                )
            )
                
            if recurrentEvents:
                statement = statement.where(or_(STEventModel.every_week == True, STEventModel.every_day == True))
            
            results = list(session.exec(statement))

            events_to_return: list[STEventModel] = []
            now = datetime.now() 

            for event in results:
                should_add = False
                rejection_reason = ""
                
                # 1. Filtro "Hoje" (Dashboard)
                if filter_today:
                    is_today = StudyTrackerSqlRepo.is_today(event.start_date)
                    is_same_weekday = event.start_date.weekday() == now.weekday()
                    
                    if event.every_week and is_same_weekday:
                        should_add = True
                    elif event.every_day:
                        should_add = True
                    elif is_today:
                        should_add = True
                    else:
                        rejection_reason = "Não é hoje nem dia da recorrência"

                    if should_add and event.recurrence_end:
                        if event.recurrence_end < now:
                             should_add = False
                             rejection_reason = f"Recorrência expirou em {event.recurrence_end}"

                # 2. Filtro por Semana (Calendário)
                elif week_number is not None:
                    event_start_week = event.start_date.isocalendar().week
                    
                    # A. Evento Recorrente (Semanal)
                    if event.every_week:
                        started_already = event_start_week <= week_number
                        not_ended = True
                        if event.recurrence_end:
                            end_week = event.recurrence_end.isocalendar().week
                            # Se acabou numa semana anterior à que pedimos
                            if end_week < week_number:
                                not_ended = False
                        
                        if started_already and not_ended:
                            should_add = True
                        else:
                            rejection_reason = f"Recorrente fora do intervalo (StartWeek: {event_start_week}, EndWeek: {event.recurrence_end})"

                    # B. Evento Recorrente (Diário)
                    elif event.every_day:
                        if event_start_week <= week_number:
                            should_add = True
                            
                    # C. Evento Normal (Único)
                    else:
                        if event_start_week == week_number:
                            should_add = True
                        else:
                            rejection_reason = f"Semana incorreta (Evento: {event_start_week} vs Pedido: {week_number})"
                
                else:
                    should_add = True

                if should_add:
                    events_to_return.append(event)
                else:
                    pass

            if study_events:
                count_before = len(events_to_return)
                events_to_return = [e for e in events_to_return if StudyTrackerSqlRepo.is_study_event(e)]
                if len(events_to_return) < count_before:
                    print(f"2. Filtro Study Events removeu {count_before - len(events_to_return)} eventos.")

            return Event.from_STEventModel(events_to_return)


    def update_receive_notifications_pref(self, user_id: int, receive: bool):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)
            user_model.receive_st_app_notifications = receive            
            session.add(user_model)
            session.commit()

    def create_not_available_schedule_block(self, user_id: int, info: UnavailableScheduleBlock):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)
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
        subtasks: list[Task] = []
        for sub_task_model in task_model.subtasks:
            subtasks.append(StudyTrackerSqlRepo.build_task(sub_task_model))

        tags: list[str] = []
        for tag_model in task_model.tags:
            tags.append(str(tag_model.id))
            
        return Task(
            id=task_model.id,
            title=task_model.title,
            description=task_model.description,
            deadline=task_model.deadline,
            priority=task_model.priority,
            tags=tags,
            status=task_model.status,
            is_micro_task=task_model.is_micro_task,
            completed_at=task_model.completed_at,
            sub_tasks=subtasks
        )
        
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
                .options(selectinload(STTaskModel.tags))
                
            if filter_uncompleted_tasks:
                statement = statement\
                    .where(STTaskModel.status != "completed")

            result = session.exec(statement)
            task_models: list[STTaskModel] = list(result.all())
            
            # Retrieve Tasks
            tasks: list[Task] = []
            for task_model in task_models:
                tasks.append(StudyTrackerSqlRepo.build_task(task_model))
            
            tasks.sort(key=lambda task: task.id if task.id is not None else 0)
            
            if order_by_deadline_and_priority:
                tasks.sort(key=lambda task: task.deadline if task.deadline is not None else datetime.max)
                tasks.sort(key=lambda task: Priority.from_str(task.priority).value, reverse=True)
                
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
        
        if task_id is None:
            while True:
                task_id = random.randint(1, database.POSTGRES_MAX_INTEGER_VALUE)
                statement = select(STTaskModel).where(STTaskModel.id == task_id)
                if session.exec(statement).first() is None:
                    break
        
        new_task_model = STTaskModel(
            id=task_id,
            title=task.title,
            description=task.description,
            deadline=task.deadline,
            priority=task.priority,
            status=task.status,
            user_id=user_id,
            parent_task_id=parent_task_id,
            is_micro_task=task.is_micro_task,
            parent_user_id=user_id if parent_task_id else None
        )
        session.add(new_task_model)
        session.flush()

        for tag_id_str in task.tags:
            try:
                tag_id = int(tag_id_str)
                tag_obj = session.get(TagModel, tag_id)
            except (ValueError, TypeError):
                tag_obj = None
                
            if tag_obj:
                association = STTaskTagModel(
                tag_id=tag_obj.id,
                task_id=new_task_model.id, 
                user_id=user_id
        )
                session.add(association)

                user_link = session.exec(
                    select(UserTagLink).where(
                        UserTagLink.user_id == user_id,
                        UserTagLink.tag_id == tag_obj.id
                    )
                ).first()

                if not user_link:
                    new_link = UserTagLink(user_id=user_id, tag_id=tag_obj.id, is_custom=True) 
                    session.add(new_link)
    
        for sub_task in task.sub_tasks:
            StudyTrackerSqlRepo.create_task_with_parent(
                sub_task, 
                None,
                user_id, 
                user_model, 
                parent_task_id=new_task_model.id, 
                session=session
            )
                
        session.commit()
        return new_task_model.id

    def create_task(self, user_id: int, task: Task, task_id: int | None) -> int:
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)
            
            return StudyTrackerSqlRepo.create_task_with_parent(
                task, 
                task_id, 
                user_id, 
                user_model, 
                parent_task_id=task.parent_task_id, 
                session=session
            )
    
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
            
            statement_events = select(STEventModel).where(
                STEventModel.user_id == user_id,
                STEventModel.task_id == task_id
            )
            
            events_to_delete = session.exec(statement_events).all()
            for event in events_to_delete:
                session.delete(event)
            session.commit()
            
            statement = select(STTaskModel)\
                .where(STTaskModel.user_id == user_id)\
                .where(STTaskModel.parent_task_id == task_id)
            
            result = session.exec(statement)
            child_tasks_models = result.all()
            
            for child in child_tasks_models:
                session.delete(child)
            session.commit()

            statement = select(STTaskModel)\
                .where(STTaskModel.user_id == user_id)\
                .where(STTaskModel.id == task_id)
            
            result = session.exec(statement)
            task_model = result.one()
            
            session.delete(task_model)
            session.commit()
            
            StudyTrackerSqlRepo.create_task(self, user_id, task, task_id)

    def update_task_status(self, user_id: int, task_id: int, new_status: str):
        with Session(engine) as session:
            statement = select(STTaskModel).where(STTaskModel.user_id == user_id).where(STTaskModel.id == task_id)
            result = session.exec(statement)
            task_model: STTaskModel = result.one()
            task_model.status = new_status
            if new_status == "completed":
                task_model.completed_at = datetime.now(timezone.utc)
            else:
                task_model.completed_at = None
            session.add(task_model)
            session.commit()
            
    def create_archive(self, user_id: int, name: str):
        with Session(engine) as session:
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)
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
        
    def create_file(self, user_id: int, archive_name: str, name: str, text_content: str = ""):
        from service.gamification import core as gamification_service
        
        with Session(engine) as session:
            statement = select(STArchiveModel)\
                .where(STArchiveModel.user_id == user_id)\
                .where(STArchiveModel.name == archive_name)
            result = session.exec(statement)
            archive_model = result.one()            
            
            new_file = STFileModel(
                name=name,
                text=text_content,
                archive_name=archive_name,
                user_id=user_id
            )
            archive_model.files.append(new_file)

            session.add(archive_model)
            session.commit()
            session.refresh(new_file)
            
            gamification_service.add_notepad_entry(session, user_id)
            
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
            user_model: UserModel = CommonsSqlRepo.get_user_or_raise(session,user_id)
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
                id=random.randint(1, 999999999), 
                value=grade.value,
                weight=grade.weight,
                curricular_unit_name=curricular_unit,
                user_id=user_id
            ))
            
            session.add(curricular_unit_model)
            session.commit()
    
    def delete_grade(self, user_id: int, curricular_unit_name: str, grade_id: int):
        with Session(engine) as session:
            statement = select(STGradeModel).where(
                STGradeModel.id == grade_id,
                STGradeModel.user_id == user_id,
                STGradeModel.curricular_unit_name == curricular_unit_name
            )
            
            result = session.exec(statement)
            grade_model_to_delete = result.first()
            
            if not grade_model_to_delete:
                raise NotFoundException(f"Grade with id {grade_id} not found for user {user_id}")
            
            session.delete(grade_model_to_delete)
            session.commit()

    def create_mood_log(self, user_id: int, value: int, label: str, emotions: list[str], impacts: list[str], date_log: datetime):
        with Session(engine) as session:
            # 1. Definir o intervalo do dia (00:00:00 até 23:59:59)
            start_of_day = date_log.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = date_log.replace(hour=23, minute=59, second=59, microsecond=999999)

            # 2. Procurar se já existe um log neste dia para este user
            statement = select(STMoodLogModel).where(
                STMoodLogModel.user_id == user_id,
                STMoodLogModel.date_log >= start_of_day,
                STMoodLogModel.date_log <= end_of_day
            )
            existing_log = session.exec(statement).first()

            if existing_log:
                # ATUALIZAR (OVERWRITE)
                existing_log.value = value
                existing_log.label = label
                existing_log.emotions = emotions
                existing_log.impacts = impacts
                existing_log.date_log = date_log # Atualiza para a hora da nova edição
                
                session.add(existing_log)
                mood_log = existing_log
            else:
                # CRIAR NOVO
                mood_log = STMoodLogModel(
                    user_id=user_id,
                    value=value,
                    label=label,
                    emotions=emotions,
                    impacts=impacts,
                    date_log=date_log
                )
                session.add(mood_log)

            session.commit()
            session.refresh(mood_log)
            return mood_log
        
    def create_daily_tags(self, user_id: int, tags: list[str], _date: date):
        with Session(engine) as session:
            for tag in tags:
                statement = select(DailyTagModel)\
                    .where(DailyTagModel.user_id == user_id)\
                    .where(DailyTagModel.tag == tag)
                
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
            
    @staticmethod
    def compute_elapsed_minutes(date1: datetime, date2: datetime) -> int:
        total_seconds = (get_datetime_utc(date1) - get_datetime_utc(date2))
        return int(total_seconds / 60) 
            
    def get_time_spent_by_tag(self, user_id: int) -> dict[int, dict[int, dict[str, int]]]:
        with Session(engine) as session:
            statement = (
            select(STEventModel)
            .where(STEventModel.user_id == user_id)
            .options(
                selectinload(STEventModel.tags_associations).selectinload(STEventTagModel.tag_ref)
            )
        )
            
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
                    tag_name = tag.name_pt or tag.name_en
                    if not tag_name:
                        tag_name = "Sem nome"

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
                .where(WeekStudyTimeModel.user_id == user_id)
                
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
                if week_study_time_model.average_by_session == 0:
                    new_average = study_session_time    
                else:
                    new_average = ((week_study_time_model.average_by_session * week_study_time_model.n_of_sessions) + study_session_time) / (week_study_time_model.n_of_sessions + 1)
                    new_average = round(new_average, 1)                
                week_study_time_model.average_by_session = new_average
                week_study_time_model.n_of_sessions += 1
                session.add(week_study_time_model)
                session.commit()
    
    def get_task(self, user_id: int, task_id: int) -> Task:
        with Session(engine) as session:
            statement = select(STTaskModel)\
                .where(STTaskModel.user_id == user_id)\
                .where(STTaskModel.id == task_id)\
                .options(selectinload(STTaskModel.tags))           

            task_model = session.exec(statement).first()
            if not task_model:
                raise NotFoundException(f"Task with id {task_id} not found for user {user_id}")           

            return StudyTrackerSqlRepo.build_task(task_model)

    def delete_task(self, user_id: int, task_id: int):
        with Session(engine) as session:
            statement = select(STTaskModel)\
                .where(STTaskModel.user_id == user_id)\
                .where(STTaskModel.id == task_id)            

            task_to_delete = session.exec(statement).first()
            if not task_to_delete:
                raise NotFoundException(f"Task with id {task_id} not found for user {user_id}")
            
            tag_links_to_delete = session.exec(select(STTaskTagModel).where(STTaskTagModel.task_id == task_id).where(STTaskTagModel.user_id == user_id)).all()
            for link in tag_links_to_delete:
                session.delete(link)

            session.delete(task_to_delete)
            session.commit()

    def delete_future_slots_for_task(self, user_id: int, task_id: int):
        with Session(engine) as session:
            now = datetime.utcnow()
            
            statement = select(STEventModel).where(
                STEventModel.user_id == user_id,
                STEventModel.task_id == task_id,
                STEventModel.start_date > now 
            )
            
            future_events_to_delete = session.exec(statement).all()
            for event in future_events_to_delete:
                session.delete(event)
            
            session.commit()

    def delete_tag(self, session: Session, tag_id: int) -> bool:
        tag = session.get(TagModel, tag_id)
        if tag is None:
            return False
        session.delete(tag)
        session.commit()
        return True