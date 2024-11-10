import random
from sqlmodel import Session, select

from repository.sql.academic_challenge.repo import AcademicChallengeRepo
from datetime import datetime
from repository.sql.models import database
from repository.sql.models.models import BatchModel, CompletedChallengeModel, NoteModel

engine = database.get_engine()

class AcademicChallengeSqlRepo(AcademicChallengeRepo):
    
    def create_new_batch(self, user_id: int, new_level: int) -> int:
        with Session(engine) as session:
            
            # Generates a random ID, that is not yet taken
            random_generated_id: int = 0
            while True:
                random_generated_id: int = random.randint(1, database.POSTGRES_MAX_INTEGER_VALUE) # For some reason, automatic ID is not working
                statement = select(BatchModel).where(BatchModel.id == random_generated_id)
                result = session.exec(statement)
                if result.first() is None:
                    break
            
            new_batch = BatchModel(
                id=random_generated_id,
                start_date=datetime.now(),
                level=new_level,
                user_id=user_id
            )
            session.add(new_batch)
            session.commit()

            return new_batch.id
        
    def create_completed_challenge(self, user_id: int, batch_id: int, challenge_id: int, challenge_day: int, conclusion_date: datetime):
        with Session(engine) as session:
            completed_challenge = CompletedChallengeModel(
                batch_id=batch_id,
                user_id=user_id,
                challenge_day=challenge_day,
                id=challenge_id,
                conclusion_date=conclusion_date,
            )
            session.add(completed_challenge)
            session.commit()

    def create_new_user_note(self, user_id: int, note: str, date: datetime):
        with Session(engine) as session:
            new_note = NoteModel(
                text=note,
                date=date,
                user_id=user_id
            )
            session.add(new_note)
            session.commit()