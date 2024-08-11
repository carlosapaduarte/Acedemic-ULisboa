package pt.ulisboa.backend.repository

import pt.ulisboa.backend.repository.domain.User
import java.util.*

interface UsersRepository {

    fun createUser(id: Int, username: String)

    fun existsUser(id: Int): Boolean

    fun getUser(id: Int): User

    fun updateUserLevel(id: Int, level: Int)

    fun updateShareProgressPreference(id: Int, publishState: Boolean)
    fun addNewUserNote(userId: Int, name: String, date: Date)
    fun addCompletedGoal(userId: Int, goalName: String, date: Date)
    fun setUserAvatar(userId: Int, avatarFilename: String)
}