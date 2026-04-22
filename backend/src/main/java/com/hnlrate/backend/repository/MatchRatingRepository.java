package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.MatchRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRatingRepository extends JpaRepository<MatchRating,Integer> {
    List<MatchRating> findByMatchId(Integer matchId);
    Optional<MatchRating> findByMatchIdAndUserId(Integer matchId, Integer userId);
    List<MatchRating> findByUserId(Integer userId);
}
