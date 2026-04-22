package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.PlayerRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRatingRepository extends JpaRepository<PlayerRating,Integer> {
    List<PlayerRating> findByMatchId(Integer matchId);
    Optional<PlayerRating> findByPlayerIdAndMatchIdAndUserId(Integer playerId, Integer matchId, Integer userId);
    List<PlayerRating> findByUserId(Integer userId);
}
