package com.hnlrate.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    // 64 hex znakova = 32 bajta = 256 bita (minimum za HS256)
    private static final String TEST_SECRET =
            "4a6f686e446f654a6f686e446f654a6f686e446f654a6f686e446f654a6f6865";
    private static final long TEST_EXPIRATION = 86400000L; // 24h

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "expirationTime", TEST_EXPIRATION);
    }

    // --- generateToken / extractUsername ---

    @Test
    void generateToken_vrataNeNullToken() {
        String token = jwtService.generateToken("pero");

        assertNotNull(token);
        assertFalse(token.isBlank());
    }

    @Test
    void extractUsername_vrataIspravnoIme() {
        String token = jwtService.generateToken("pero");

        assertEquals("pero", jwtService.extractUsername(token));
    }

    // --- isTokenValid ---

    @Test
    void isTokenValid_vrataTrue_ZaIspravniToken() {
        String token = jwtService.generateToken("pero");

        assertTrue(jwtService.isTokenValid(token, "pero"));
    }

    @Test
    void isTokenValid_vrataFalse_ZaPogresanUsername() {
        String token = jwtService.generateToken("pero");

        assertFalse(jwtService.isTokenValid(token, "drugi"));
    }

    @Test
    void isTokenValid_bacaException_ZaIstekliToken() {
        JwtService kratkotrajanService = new JwtService();
        ReflectionTestUtils.setField(kratkotrajanService, "secretKey", TEST_SECRET);
        ReflectionTestUtils.setField(kratkotrajanService, "expirationTime", -1000L);

        String token = kratkotrajanService.generateToken("pero");

        assertThrows(ExpiredJwtException.class,
                () -> kratkotrajanService.isTokenValid(token, "pero"));
    }

    @Test
    void generateToken_razlicitiKorisnici_razlicitiTokeni() {
        String token1 = jwtService.generateToken("pero");
        String token2 = jwtService.generateToken("ivo");

        assertNotEquals(token1, token2);
        assertEquals("pero", jwtService.extractUsername(token1));
        assertEquals("ivo", jwtService.extractUsername(token2));
    }
}
