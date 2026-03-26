package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.AtmosphereRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AtmosphereRatingRepository extends JpaRepository<AtmosphereRating,Integer> {
    List<AtmosphereRating> findByMatchId(Integer matchId);
    Optional<AtmosphereRating> findByMatchIdAndUserId(Integer matchId, Integer userId);
}
