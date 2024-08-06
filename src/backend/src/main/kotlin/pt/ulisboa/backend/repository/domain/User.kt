package pt.ulisboa.backend.repository.domain

import java.util.*

data class UserGoal(
    val name: String,
    val date: Date
)

data class User(
    val id: Int,
    val username: String,
    val level: Int, // TODO: for development ease: When user is created, this is the default level
    val startDate: Date,
    val shareProgress: Boolean,
    val userGoals: List<UserGoal> = emptyList()
)