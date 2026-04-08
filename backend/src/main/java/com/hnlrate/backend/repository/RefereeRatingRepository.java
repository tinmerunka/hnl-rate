package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.RefereeRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefereeRatingRepository extends JpaRepository<RefereeRating,Integer> {
    List<RefereeRating> findByMatchId(Integer matchId);
    Optional<RefereeRating> findByMatchIdAndUserId(Integer matchId, Integer userId);
}
