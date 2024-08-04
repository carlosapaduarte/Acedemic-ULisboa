package pt.ulisboa.backend.repository

import pt.ulisboa.backend.http.exceptions.NotFoundException
import pt.ulisboa.backend.repository.domain.User
import pt.ulisboa.backend.repository.domain.UserGoal

@org.springframework.stereotype.Repository
class MemoryUsersRepository : UsersRepository {

    val users = mutableMapOf<Int, User>()

    override fun createUser(id: Int, username: String) {
        users[id] = User(id, username, null, 1, false)
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

    override fun addNewUserGoal(userId: Int, name: String) {
        val user = users[userId] ?: throw NotFoundException("User not found")
        users[userId] = user.copy(userGoals = user.userGoals.toMutableList().apply { add(UserGoal(name, user.currentDay)) })
    }
}