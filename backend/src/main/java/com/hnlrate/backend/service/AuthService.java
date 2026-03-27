package com.hnlrate.backend.service;

import com.hnlrate.backend.dto.AuthResponseDTO;
import com.hnlrate.backend.dto.LoginDTO;
import com.hnlrate.backend.dto.RegisterDTO;
import com.hnlrate.backend.model.Role;
import com.hnlrate.backend.model.User;
import com.hnlrate.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public void register(RegisterDTO dto) {
        if (userService.getByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email već postoji!");
        }
        if (userService.getByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("Username već postoji!");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.USER);
        user.setBlocked(false);

        userService.save(user);
    }

    public AuthResponseDTO login(LoginDTO dto) {
        User user = userService.getByUsername(dto.getUsername())
                .orElseThrow(() -> new RuntimeException("Pogrešan username ili lozinka!"));

        if (user.getBlocked()) {
            throw new RuntimeException("Vaš račun je blokiran!");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Pogrešan username ili lozinka!");
        }

        String token = jwtService.generateToken(user.getUsername());

        return new AuthResponseDTO(token, user.getUsername(), user.getRole().name());
    }
}