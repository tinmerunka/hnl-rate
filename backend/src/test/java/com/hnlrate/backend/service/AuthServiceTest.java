package com.hnlrate.backend.service;

import com.hnlrate.backend.dto.LoginDTO;
import com.hnlrate.backend.dto.RegisterDTO;
import com.hnlrate.backend.dto.ResetPasswordDTO;
import com.hnlrate.backend.model.PasswordResetToken;
import com.hnlrate.backend.model.RefreshToken;
import com.hnlrate.backend.model.User;
import com.hnlrate.backend.repository.PasswordResetTokenRepository;
import com.hnlrate.backend.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserService userService;
    @Mock JwtService jwtService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock RefreshTokenService refreshTokenService;
    @Mock PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock EmailService emailService;

    @InjectMocks AuthService authService;

    // --- register ---

    @Test
    void register_bacaExceptionAkoEmailVecPostoji() {
        RegisterDTO dto = new RegisterDTO();
        dto.setEmail("pero@mail.com");
        dto.setUsername("pero");
        dto.setPassword("lozinka");

        when(userService.getByEmail("pero@mail.com")).thenReturn(Optional.of(new User()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(dto));
        assertEquals("Email već postoji!", ex.getMessage());
        verify(userService, never()).save(any());
    }

    @Test
    void register_bacaExceptionAkoUsernameVecPostoji() {
        RegisterDTO dto = new RegisterDTO();
        dto.setEmail("novo@mail.com");
        dto.setUsername("pero");
        dto.setPassword("lozinka");

        when(userService.getByEmail("novo@mail.com")).thenReturn(Optional.empty());
        when(userService.getByUsername("pero")).thenReturn(Optional.of(new User()));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(dto));
        assertEquals("Username već postoji!", ex.getMessage());
        verify(userService, never()).save(any());
    }

    @Test
    void register_spremaKorisnikaKadSuPodaciValidni() {
        RegisterDTO dto = new RegisterDTO();
        dto.setEmail("novi@mail.com");
        dto.setUsername("noviuser");
        dto.setPassword("lozinka");

        when(userService.getByEmail("novi@mail.com")).thenReturn(Optional.empty());
        when(userService.getByUsername("noviuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("lozinka")).thenReturn("hash123");

        authService.register(dto);

        verify(userService).save(any(User.class));
    }

    // --- login ---

    @Test
    void login_bacaExceptionAkoKorisnikNijePronadjen() {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("nepostoji");
        dto.setPassword("lozinka");

        when(userService.getByUsername("nepostoji")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(dto));
        assertEquals("Pogrešan username ili lozinka!", ex.getMessage());
    }

    @Test
    void login_bacaExceptionAkoJeKorisnikBlokiran() {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("pero");
        dto.setPassword("lozinka");

        User user = new User();
        user.setBlocked(true);
        when(userService.getByUsername("pero")).thenReturn(Optional.of(user));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(dto));
        assertEquals("Vaš račun je blokiran!", ex.getMessage());
    }

    @Test
    void login_bacaExceptionAkoPogresnaLozinka() {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("pero");
        dto.setPassword("kriva");

        User user = new User();
        user.setBlocked(false);
        user.setPasswordHash("hash");
        when(userService.getByUsername("pero")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("kriva", "hash")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(dto));
        assertEquals("Pogrešan username ili lozinka!", ex.getMessage());
    }

    @Test
    void login_vrataAuthResponseKadSuPodaciTocni() {
        LoginDTO dto = new LoginDTO();
        dto.setUsername("pero");
        dto.setPassword("tocna");

        User user = new User();
        user.setUsername("pero");
        user.setBlocked(false);
        user.setPasswordHash("hash");

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("refresh-abc");
        refreshToken.setUser(user);

        when(userService.getByUsername("pero")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("tocna", "hash")).thenReturn(true);
        when(jwtService.generateToken("pero")).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(user)).thenReturn(refreshToken);

        var result = authService.login(dto);

        assertEquals("access-token", result.getAccessToken());
        assertEquals("refresh-abc", result.getRefreshToken());
    }

    // --- resetPassword ---

    @Test
    void resetPassword_bacaExceptionAkoTokenNijeValidan() {
        ResetPasswordDTO dto = new ResetPasswordDTO();
        dto.setToken("nevalidan");
        dto.setNewPassword("novaLozinka");

        when(passwordResetTokenRepository.findByToken("nevalidan")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.resetPassword(dto));
        assertEquals("Token nije validan!", ex.getMessage());
    }

    @Test
    void resetPassword_bacaExceptionAkoJeTokenVecIskoristen() {
        ResetPasswordDTO dto = new ResetPasswordDTO();
        dto.setToken("token123");
        dto.setNewPassword("novaLozinka");

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsed(true);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));

        when(passwordResetTokenRepository.findByToken("token123")).thenReturn(Optional.of(resetToken));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.resetPassword(dto));
        assertEquals("Token je već iskorišten!", ex.getMessage());
    }

    @Test
    void resetPassword_bacaExceptionAkoJeTokenIstekao() {
        ResetPasswordDTO dto = new ResetPasswordDTO();
        dto.setToken("token123");
        dto.setNewPassword("novaLozinka");

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsed(false);
        resetToken.setExpiresAt(LocalDateTime.now().minusMinutes(1));

        when(passwordResetTokenRepository.findByToken("token123")).thenReturn(Optional.of(resetToken));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.resetPassword(dto));
        assertEquals("Token je istekao!", ex.getMessage());
    }

    @Test
    void resetPassword_uspjesnoResetiralozinkuSValidnimTokenom() {
        ResetPasswordDTO dto = new ResetPasswordDTO();
        dto.setToken("token123");
        dto.setNewPassword("novaLozinka");

        User user = new User();
        user.setId(1);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUsed(false);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        resetToken.setUser(user);

        when(passwordResetTokenRepository.findByToken("token123")).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("novaLozinka")).thenReturn("noviHash");

        authService.resetPassword(dto);

        verify(userService).updatePasswordHash(1, "noviHash");
        verify(passwordResetTokenRepository).save(resetToken);
        assertTrue(resetToken.isUsed());
    }
}
