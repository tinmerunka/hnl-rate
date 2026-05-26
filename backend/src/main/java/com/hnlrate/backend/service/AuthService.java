package com.hnlrate.backend.service;

import com.hnlrate.backend.dto.*;
import com.hnlrate.backend.model.PasswordResetToken;
import com.hnlrate.backend.model.RefreshToken;
import com.hnlrate.backend.model.Role;
import com.hnlrate.backend.model.User;
import com.hnlrate.backend.repository.PasswordResetTokenRepository;
import com.hnlrate.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

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

        return new AuthResponseDTO(accessToken, refreshToken.getToken(), user.getRole().name());
    }

    public AuthResponseDTO refresh(RefreshTokenRequestDTO dto) {
        return refreshWithToken(dto.getRefreshToken());
    }

    public AuthResponseDTO refreshWithToken(String token) {
        if (token == null) throw new RuntimeException("Refresh token nije pronađen!");

        RefreshToken refreshToken = refreshTokenService.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token nije pronađen!"));

        if (!refreshTokenService.isValid(refreshToken)) {
            throw new RuntimeException("Refresh token je istekao ili je nevažeći!");
        }

        RefreshToken newRefreshToken = refreshTokenService.rotate(refreshToken);
        String newAccessToken = jwtService.generateToken(newRefreshToken.getUser().getUsername());

        return new AuthResponseDTO(newAccessToken, newRefreshToken.getToken(), newRefreshToken.getUser().getRole().name());
    }

    public void logout(RefreshTokenRequestDTO dto) {
        logoutWithToken(dto.getRefreshToken());
    }

    public void logoutWithToken(String token) {
        RefreshToken refreshToken = refreshTokenService.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token nije pronađen!"));

        refreshTokenService.revokeAllUserTokens(refreshToken.getUser());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordDTO dto) {
        userService.getByEmail(dto.getEmail()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser_Id(user.getId());

            PasswordResetToken resetToken = new PasswordResetToken();
            String code = String.format("%06d", new java.util.Random().nextInt(1_000_000));
            resetToken.setToken(code);
            resetToken.setUser(user);
            resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(15));
            passwordResetTokenRepository.save(resetToken);

            emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordDTO dto) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new RuntimeException("Token nije validan!"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Token je već iskorišten!");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token je istekao!");
        }

        User user = resetToken.getUser();
        String newHash = passwordEncoder.encode(dto.getNewPassword());
        userService.updatePasswordHash(user.getId(), newHash);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        refreshTokenService.revokeAllUserTokens(user);
    }
}