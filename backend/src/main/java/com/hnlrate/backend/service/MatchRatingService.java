package com.hnlrate.backend.service;

import com.hnlrate.backend.model.MatchRating;
import com.hnlrate.backend.repository.MatchRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MatchRatingService {

    private final MatchRatingRepository matchRatingRepository;

    public List<MatchRating> getByMatchId(Integer matchId) {
        return matchRatingRepository.findByMatchId(matchId);
    }

    public Optional<MatchRating> getByMatchAndUser(Integer matchId, Integer userId) {
        return matchRatingRepository.findByMatchIdAndUserId(matchId, userId);
    }

    public MatchRating save(MatchRating matchRating) {
        return matchRatingRepository.save(matchRating);
    }

    public void delete(Integer id) {
        matchRatingRepository.deleteById(id);
    }

    public Double getAverageRating(Integer matchId) {
        return matchRatingRepository.findByMatchId(matchId)
                .stream()
                .mapToInt(MatchRating::getRating)
                .average()
                .orElse(0.0);
    }
}
