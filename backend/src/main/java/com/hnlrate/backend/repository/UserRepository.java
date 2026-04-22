package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query(value = "UPDATE users SET password_hash = :passwordHash WHERE id = :id", nativeQuery = true)
    void updatePasswordHash(@Param("id") Integer id, @Param("passwordHash") String passwordHash);
}
