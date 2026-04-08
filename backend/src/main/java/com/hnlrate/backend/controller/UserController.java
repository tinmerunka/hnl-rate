package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.UserProfileDTO;
import com.hnlrate.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMe(Authentication auth) {
        return userService.getByUsername(auth.getName())
                .map(user -> ResponseEntity.ok(new UserProfileDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }
}
