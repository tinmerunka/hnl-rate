package com.hnlrate.backend.service;

import com.hnlrate.backend.dto.AuthResponseDTO;
import com.hnlrate.backend.dto.LoginDTO;
import com.hnlrate.backend.dto.RefreshTokenRequestDTO;
import com.hnlrate.backend.dto.RegisterDTO;
import com.hnlrate.backend.model.RefreshToken;
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
    private final RefreshTokenService refreshTokenService;

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

        String accessToken = jwtService.generateToken(user.getUsername());
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponseDTO(accessToken, refreshToken.getToken());
    }

    public AuthResponseDTO refresh(RefreshTokenRequestDTO dto) {
        RefreshToken refreshToken = refreshTokenService.findByToken(dto.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token nije pronađen!"));

        if (!refreshTokenService.isValid(refreshToken)) {
            throw new RuntimeException("Refresh token je istekao ili je nevažeći!");
        }

        RefreshToken newRefreshToken = refreshTokenService.rotate(refreshToken);
        String newAccessToken = jwtService.generateToken(newRefreshToken.getUser().getUsername());

        return new AuthResponseDTO(newAccessToken, newRefreshToken.getToken());
    }

    public void logout(RefreshTokenRequestDTO dto) {
        RefreshToken refreshToken = refreshTokenService.findByToken(dto.getRefreshToken())
                .orElseThrow(() -> new RuntimeException("Refresh token nije pronađen!"));

        refreshTokenService.revokeAllUserTokens(refreshToken.getUser());
    }
}