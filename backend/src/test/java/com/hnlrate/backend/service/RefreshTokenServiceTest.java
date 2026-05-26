package com.hnlrate.backend.service;

import com.hnlrate.backend.model.RefreshToken;
import com.hnlrate.backend.model.User;
import com.hnlrate.backend.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock RefreshTokenRepository refreshTokenRepository;

    @InjectMocks RefreshTokenService refreshTokenService;

    // --- isValid ---

    @Test
    void isValid_vrataTrue_AkoTokenJosNijeIstekao() {
        RefreshToken token = new RefreshToken();
        token.setExpiresAt(LocalDateTime.now().plusDays(1));

        assertTrue(refreshTokenService.isValid(token));
    }

    @Test
    void isValid_vrataFalse_AkoJeTokenIstekao() {
        RefreshToken token = new RefreshToken();
        token.setExpiresAt(LocalDateTime.now().minusSeconds(1));

        assertFalse(refreshTokenService.isValid(token));
    }

    // --- createRefreshToken ---

    @Test
    void createRefreshToken_brisePrethodnISpremaNovi() {
        User user = new User();
        user.setId(1);

        RefreshToken savedToken = new RefreshToken();
        savedToken.setToken("novi-token");
        savedToken.setUser(user);
        savedToken.setExpiresAt(LocalDateTime.now().plusDays(7));

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(savedToken);

        RefreshToken result = refreshTokenService.createRefreshToken(user);

        verify(refreshTokenRepository).deleteByUser(user);
        verify(refreshTokenRepository).save(any(RefreshToken.class));
        assertEquals("novi-token", result.getToken());
        assertEquals(user, result.getUser());
    }

    @Test
    void createRefreshToken_tokenImaRokOd7Dana() {
        User user = new User();
        RefreshToken savedToken = new RefreshToken();
        savedToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        savedToken.setUser(user);

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(savedToken);

        RefreshToken result = refreshTokenService.createRefreshToken(user);

        assertTrue(result.getExpiresAt().isAfter(LocalDateTime.now().plusDays(6)));
    }

    // --- findByToken ---

    @Test
    void findByToken_vrataTokenAkoPostoji() {
        RefreshToken token = new RefreshToken();
        token.setToken("abc");
        when(refreshTokenRepository.findByToken("abc")).thenReturn(Optional.of(token));

        Optional<RefreshToken> result = refreshTokenService.findByToken("abc");

        assertTrue(result.isPresent());
        assertEquals("abc", result.get().getToken());
    }

    @Test
    void findByToken_vrataPrazanOptionalAkoNePostoji() {
        when(refreshTokenRepository.findByToken("nepostoji")).thenReturn(Optional.empty());

        Optional<RefreshToken> result = refreshTokenService.findByToken("nepostoji");

        assertFalse(result.isPresent());
    }

    // --- rotate ---

    @Test
    void rotate_kreiraNovTokenZaIstogKorisnika() {
        User user = new User();
        user.setId(5);

        RefreshToken stariToken = new RefreshToken();
        stariToken.setToken("stari");
        stariToken.setUser(user);

        RefreshToken noviToken = new RefreshToken();
        noviToken.setToken("novi");
        noviToken.setUser(user);

        when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(noviToken);

        RefreshToken result = refreshTokenService.rotate(stariToken);

        assertEquals("novi", result.getToken());
        assertEquals(user, result.getUser());
    }

    // --- countActiveSessions ---

    @Test
    void countActiveSessions_delegiraNaRepository() {
        when(refreshTokenRepository.countByExpiresAtAfter(any(LocalDateTime.class))).thenReturn(3L);

        assertEquals(3L, refreshTokenService.countActiveSessions());
    }
}
