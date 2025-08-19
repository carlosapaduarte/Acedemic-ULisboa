from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

class BadgeCriteriaEvaluator(ABC):
    @abstractmethod
    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        """
        Avalia se o critério é cumprido com base nas métricas do utilizador.
        user_metrics é um dicionário que representa os dados de UserMetric.
        context pode conter dados adicionais necessários para a avaliação (ex: 'challenge_id' do evento atual).
        """
        pass

class LoginStreakEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("login_streak", 0) >= self.criteria_value

class ChallengeCompleteEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, challenge_code: str):
        self.challenge_code = challenge_code

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        completed_challenges = user_metrics.get("completed_challenges", [])
        return self.challenge_code in completed_challenges

class PomodoroCyclesEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("total_pomodoro_cycles", 0) >= self.criteria_value

class TasksCompletedEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("total_tasks_completed", 0) >= self.criteria_value

class NotepadEntriesEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("total_notepad_entries", 0) >= self.criteria_value

class ForumQuestionsEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("total_forum_questions", 0) >= self.criteria_value

class ForumAnswersEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("total_forum_answers", 0) >= self.criteria_value

class EventsAddedEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        #FALTA métrica para o número total de eventos adicionados
        return user_metrics.get("total_events_added", 0) >= self.criteria_value

class CompletedChallengesCountEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("completed_challenges_count", 0) >= self.criteria_value

class SimultaneousToolUsesEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("simultaneous_tool_uses", 0) >= self.criteria_value

class TotalBadgesCountEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        if not context or "earned_badge_codes" not in context:
            return False
        
        # Conta o número de códigos de medalhas no contexto dado
        num_earned_badges = len(context["earned_badge_codes"])
        
        return num_earned_badges >= self.criteria_value

def create_badge_criteria_evaluator(criteria_json: Dict[str, Any]) -> Optional[BadgeCriteriaEvaluator]:
    if not criteria_json:
        return None

    criteria_type = criteria_json.get("type")
    if criteria_type == "login_streak":
        return LoginStreakEvaluator(criteria_json["value"])
    elif criteria_type == "challenge_complete":
        return ChallengeCompleteEvaluator(criteria_json["challenge_id"])
    elif criteria_type == "pomodoro_cycles":
        return PomodoroCyclesEvaluator(criteria_json["value"])
    elif criteria_type == "tasks_completed":
        return TasksCompletedEvaluator(criteria_json["value"])
    elif criteria_type == "notepad_entries":
        return NotepadEntriesEvaluator(criteria_json["value"])
    elif criteria_type == "forum_questions":
        return ForumQuestionsEvaluator(criteria_json["value"])
    elif criteria_type == "forum_answers":
        return ForumAnswersEvaluator(criteria_json["value"])
    elif criteria_type == "events_added":
        return EventsAddedEvaluator(criteria_json["value"])
    elif criteria_type == "simultaneous_tool_uses":
        return SimultaneousToolUsesEvaluator(criteria_json["value"])
    elif criteria_type == "completed_challenges":
        return CompletedChallengesCountEvaluator(criteria_json["value"])
    elif criteria_type == "challenge_streak":
        return ChallengeStreakEvaluator(criteria_json["value"])
    elif criteria_type == "total_badges_count":
        return TotalBadgesCountEvaluator(criteria_json["value"])
    return None

class ChallengeStreakEvaluator(BadgeCriteriaEvaluator):
    def __init__(self, criteria_value: int):
        self.criteria_value = criteria_value

    def evaluate(self, user_metrics: Dict[str, Any], context: Dict[str, Any] = None) -> bool:
        return user_metrics.get("challenge_completion_streak", 0) >= self.criteria_value

