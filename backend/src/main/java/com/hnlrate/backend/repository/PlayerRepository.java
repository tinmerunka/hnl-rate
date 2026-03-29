package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    List<Player> findByClubId(Integer clubId);
}
