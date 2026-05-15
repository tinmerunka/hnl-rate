package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.MatchRating;
import com.hnlrate.backend.model.MatchRatingVote;
import com.hnlrate.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRatingVoteRepository extends JpaRepository<MatchRatingVote, Integer> {
    Optional<MatchRatingVote> findByMatchRatingAndUser(MatchRating matchRating, User user);
    List<MatchRatingVote> findByMatchRatingIn(List<MatchRating> matchRatings);
    List<MatchRatingVote> findByMatchRatingInAndUser(List<MatchRating> matchRatings, User user);
}
