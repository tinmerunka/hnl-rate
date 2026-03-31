package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.RefreshToken;
import com.hnlrate.backend.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUser(User user);
    @Transactional
    void deleteByUser(User user);
}
