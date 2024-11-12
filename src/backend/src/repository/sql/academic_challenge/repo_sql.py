import random
from datetime import datetime

from sqlmodel import Session, select

from repository.sql.academic_challenge.repo import AcademicChallengeRepo
from repository.sql.models import database
from repository.sql.models.models import BatchModel, NoteModel, ChallengeModel

engine = database.get_engine()


class AcademicChallengeSqlRepo(AcademicChallengeRepo):

    def create_new_batch(self, user_id: int, new_level: int, challenge_ids: list[int] | list[list[int]]) -> int:
        with Session(engine) as session:
            # Create a new batch
            new_batch = BatchModel(
                id=random.randint(1, 999999999),  # Consider using a database-generated ID
                start_date=datetime.now(),
                level=new_level,
                user_id=user_id
            )
            session.add(new_batch)
            session.flush()  # Flush to ensure new_batch.id is available

            # Populate challenges based on level
            challenges = []
            if new_level in [1, 2]:
                challenge_ids: list[int]
                # For levels 1 or 2, create a single challenge per ID
                for index, challenge_id in enumerate(challenge_ids):
                    new_challenge = ChallengeModel(
                        id=challenge_id,
                        challenge_day=index + 1,  # 1-indexed challenge day
                        completion_date=None,
                        user_id=user_id,
                        batch_id=new_batch.id  # Associate with the new batch
                    )
                    challenges.append(new_challenge)

            elif new_level == 3:
                challenge_ids: list[list[int]]
                # For level 3, create challenges with the challenge_day based on the sublist index
                for sublist_index, sublist in enumerate(challenge_ids):
                    for challenge_id in sublist:
                        new_challenge = ChallengeModel(
                            id=challenge_id,
                            challenge_day=sublist_index + 1,  # 1-indexed based on the sublist index
                            completion_date=None,
                            user_id=user_id,
                            batch_id=new_batch.id  # Associate with the new batch
                        )
                        challenges.append(new_challenge)

            # Add all challenges to the session
            session.add_all(challenges)
            session.commit()

            return new_batch.id

    def complete_challenge(self, user_id: int, batch_id: int, challenge_id: int, challenge_day: int,
                           completion_date: datetime):
        with Session(engine) as session:
            # Retrieve the existing Challenge row
            statement = select(ChallengeModel).where(
                ChallengeModel.user_id == user_id,
                ChallengeModel.batch_id == batch_id,
                ChallengeModel.id == challenge_id,
                ChallengeModel.challenge_day == challenge_day
            )

            existing_challenge = session.exec(statement).first()

            if existing_challenge:
                # Update the completion date
                existing_challenge.completion_date = completion_date
                session.add(existing_challenge)  # This is optional; changes are tracked automatically
                session.commit()
            else:
                raise ValueError("Challenge not found")

    def create_new_user_note(self, user_id: int, note: str, date: datetime):
        with Session(engine) as session:
            new_note = NoteModel(
                text=note,
                date=date,
                user_id=user_id
            )
            session.add(new_note)
            session.commit()
