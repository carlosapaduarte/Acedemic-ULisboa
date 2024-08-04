package pt.ulisboa.backend.repository.domain

data class UserGoal(
    val name: String,
    val day: Int
)

data class User(
    val id: Int,
    val username: String,
    val level: Int?,
    val currentDay: Int,
    val shareProgress: Boolean,
    val userGoals: List<UserGoal> = emptyList()
)