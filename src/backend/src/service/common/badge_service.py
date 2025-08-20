from repository.sql.commons.repo_badge import BadgeRepo

badge_repo = BadgeRepo()

def assign_for_event(user_id: int, event: str):
    if event == "first_login":
        print(f"Assigning FIRST_LOGIN badge to user {user_id}")
        badge_repo.assign(user_id, "primeiro_passo")
    elif event == "challenge_completed": #TODO
        """count = ChallengeRepo().count_completed(user_id)
        if count >= 5:
            badge_repo.assign(user_id, "FIVE_CHALLENGES")"""