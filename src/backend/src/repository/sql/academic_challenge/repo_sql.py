import random
from datetime import datetime
from typing import Optional

from sqlmodel import Session, select

from repository.sql.academic_challenge.repo import AcademicChallengeRepo
from repository.sql.models import database
from repository.sql.models.models import BatchModel, ChallengeModel, BatchDayModel

engine = database.get_engine()


class AcademicChallengeSqlRepo(AcademicChallengeRepo):

    def create_new_batch(self, user_id: int, new_level: int, challenge_ids: list[int] | list[list[int]]) -> int:
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
            session.flush()  # Flush to ensure new_batch.id is available

            batch_days = []
            challenges = []

            # Populate the batch_days and challenges based on the level
            if new_level in [1, 2]:
                challenge_ids: list[int]
                # For levels 1 or 2, create a single challenge per ID
                for day_index, challenge_id in enumerate(challenge_ids):
                    new_batch_day = BatchDayModel(
                        id=day_index + 1,
                        batch_id=new_batch.id,
                        user_id=user_id,
                        notes=""
                    )
                    batch_days.append(new_batch_day)

                    new_challenge = ChallengeModel(
                        id=challenge_id,
                        batch_day_id=day_index + 1,
                        batch_id=new_batch.id,
                        user_id=user_id,
                        completion_date=None
                    )
                    challenges.append(new_challenge)

            elif new_level == 3:
                challenge_ids: list[list[int]]
                # For level 3, create challenges with the challenge_day based on the sublist index
                for day_index, sublist in enumerate(challenge_ids):
                    new_batch_day = BatchDayModel(
                        id=day_index + 1,
                        batch_id=new_batch.id,
                        user_id=user_id,
                        notes=""
                    )
                    batch_days.append(new_batch_day)

                    for challenge_id in sublist:
                        new_challenge = ChallengeModel(
                            id=challenge_id,
                            batch_day_id=day_index + 1,
                            batch_id=new_batch.id,
                            user_id=user_id,
                            completion_date=None
                        )
                        challenges.append(new_challenge)

            session.add_all(batch_days)
            session.flush()
            session.add_all(challenges)
            session.commit()

            return new_batch.id

    def complete_challenge(self, user_id: int, batch_id: int, batch_day_id: int, challenge_id: int, completion_date: datetime, user_answer: Optional[str] = None):
        with Session(engine) as session:
            statement = select(ChallengeModel).where(
                ChallengeModel.user_id == user_id,
                ChallengeModel.batch_id == batch_id,
                ChallengeModel.batch_day_id == batch_day_id,
                ChallengeModel.id == challenge_id
            )

            existing_challenge = session.exec(statement).first()
            if not existing_challenge:
                raise ValueError("Challenge not found")

            existing_challenge.completion_date = completion_date
            existing_challenge.user_answer = user_answer
            session.add(existing_challenge)  # This is optional; changes are tracked automatically
            session.commit()

    def edit_day_notes(self, user_id: int, batch_id: int, batch_day_id: int, notes: str, date: datetime, user_answer: Optional[str] = None):
        with Session(engine) as session:
            statement = select(BatchDayModel).where(
                BatchDayModel.user_id == user_id,
                BatchDayModel.batch_id == batch_id,
                BatchDayModel.id == batch_day_id
            )

            existing_batch_day = session.exec(statement).first()

            if not existing_batch_day:
                raise ValueError("Batch day not found")

            existing_batch_day.notes = notes
            session.add(existing_batch_day)  # This is optional; changes are tracked automatically
            session.commit()
