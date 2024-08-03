package pt.ulisboa.backend.repository

import pt.ulisboa.backend.http.exceptions.NotFoundException
import pt.ulisboa.backend.repository.domain.User

@org.springframework.stereotype.Repository
class MemoryUsersRepository : UsersRepository {

    val users = mutableMapOf<Int, User>()

    override fun createUser(id: Int, username: String) {
        users[id] = User(id, username, null, null)
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
}