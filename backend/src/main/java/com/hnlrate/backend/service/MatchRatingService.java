package com.hnlrate.backend.service;

import com.hnlrate.backend.dto.CommentAdminDTO;
import com.hnlrate.backend.dto.RatingAdminDTO;
import com.hnlrate.backend.model.MatchRating;
import com.hnlrate.backend.repository.MatchRatingRepository;
import jakarta.transaction.Transactional;
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

    public Optional<MatchRating> getById(Integer id) {
        return matchRatingRepository.findById(id);
    }

    public List<RatingAdminDTO> getAllForAdmin() {
        return matchRatingRepository.findAllAsDTO();
    }

    public List<CommentAdminDTO> getAllWithComments() {
        return matchRatingRepository.findAllCommentsAsDTO();
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
