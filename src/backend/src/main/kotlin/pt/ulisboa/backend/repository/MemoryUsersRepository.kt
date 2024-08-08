package pt.ulisboa.backend.repository

import pt.ulisboa.backend.http.exceptions.NotFoundException
import pt.ulisboa.backend.repository.domain.Goal
import pt.ulisboa.backend.repository.domain.User
import pt.ulisboa.backend.repository.domain.UserNote
import java.util.*

@org.springframework.stereotype.Repository
class MemoryUsersRepository : UsersRepository {

    val users = mutableMapOf<Int, User>()

    override fun createUser(id: Int, username: String) {
        users[id] = User(id, username, 1, Date(), false)
    }

    override fun existsUser(id: Int): Boolean {
        return users.containsKey(id)
    }

    override fun getUser(id: Int): User {
        return users[id] ?: throw NotFoundException("User not found")
    }

    override fun updateUserLevel(id: Int, level: Int) {
        val user = users[id] ?: throw NotFoundException("User not found")
        users[id] = user.copy(level = level)
    }

    override fun updateShareProgressPreference(id: Int, publishState: Boolean) {
        val user = users[id] ?: throw NotFoundException("User not found")
        users[id] = user.copy(shareProgress = publishState)
    }

    override fun addNewUserNote(userId: Int, name: String, date: Date) {
        val user = users[userId] ?: throw NotFoundException("User not found")
        users[userId] = user.copy(userNotes = user.userNotes.toMutableList().apply { add(UserNote(name, date)) })
    }

    override fun addCompletedGoal(userId: Int, goalName: String, date: Date) {
        val user = users[userId] ?: throw NotFoundException("User not found")
        users[userId] = user.copy(completedGoals = user.completedGoals.toMutableSet().apply { add(Goal(goalName, date)) })
    }
}