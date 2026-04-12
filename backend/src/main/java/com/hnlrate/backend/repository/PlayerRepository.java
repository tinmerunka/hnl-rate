package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    List<Player> findByClubId(Integer clubId);
    Optional<Player> findByApiFootballId(Integer apiFootballId);
}
