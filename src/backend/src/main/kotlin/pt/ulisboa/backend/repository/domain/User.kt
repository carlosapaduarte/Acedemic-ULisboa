package pt.ulisboa.backend.repository.domain

import java.util.*

data class UserNote(
    val name: String,
    val date: Date
)

// Not sure if this is the best way to represent a Frontend goal
data class Goal(
    val name: String,
    val date: Date
)

data class User(
    val id: Int,
    val username: String,
    val level: Int, // TODO: for development ease: When user is created, this is the default level
    val avatarFilename: String?,
    val startDate: Date,
    val shareProgress: Boolean,
    val userNotes: List<UserNote> = emptyList(),
    val completedGoals: Set<Goal> = emptySet()
)