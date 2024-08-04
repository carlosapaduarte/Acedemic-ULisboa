package pt.ulisboa.backend.http

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import pt.ulisboa.backend.dtos.*
import pt.ulisboa.backend.service.Service


@RestController
class Controller(val service: Service) {

    @PostMapping("/login")
    fun login(
        @RequestBody inputDto: LoginInputDto
    ): ResponseEntity<String> {
        when (service.login(inputDto.id)) {
            Service.LoginResult.SUCCESS -> return ResponseEntity.ok().build()
            Service.LoginResult.CREATED_USER -> {
                val location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}")
                    .buildAndExpand(inputDto.id)
                    .toUri()
                return ResponseEntity.created(location).build()
            }
        }
    }

    @PostMapping("/set-level")
    fun setLevel(
        @RequestBody inputDto: SetLevelInputDto
    ) {
        service.setLevel(inputDto.id, inputDto.level)
    }

    @PostMapping("/set-publish-state-preference")
    fun setShareProgressPreference(
        @RequestBody inputDto: SetShareProgressPreferenceDto
    ) {
        service.setShareProgressPreference(inputDto.id, inputDto.shareProgress)
    }

    @GetMapping("/user-info")
    fun getUserInfo(
        @RequestBody inputDto: GetUserInfoInputDto
    ): UserInfo = service.getUserInfo(inputDto.id)

    @GetMapping("/ping")
    fun ping() = "pong"
}