package pt.ulisboa.backend.repository

import pt.ulisboa.backend.repository.domain.User

interface UsersRepository {

    fun createUser(id: Int, username: String)

    fun existsUser(id: Int): Boolean

    fun getUser(id: Int): User

    fun updateUserLevel(id: Int, level: Int)
}