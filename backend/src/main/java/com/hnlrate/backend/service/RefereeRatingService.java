package com.hnlrate.backend.service;

import com.hnlrate.backend.dto.RatingAdminDTO;
import com.hnlrate.backend.model.RefereeRating;
import com.hnlrate.backend.repository.RefereeRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefereeRatingService {

    private final RefereeRatingRepository refereeRatingRepository;

    public List<RatingAdminDTO> getAllForAdmin() {
        return refereeRatingRepository.findAllAsDTO();
    }

    public List<RefereeRating> getByMatchId(Integer matchId) {
        return refereeRatingRepository.findByMatchId(matchId);
    }

    public Optional<RefereeRating> getByMatchAndUser(Integer matchId, Integer userId) {
        return refereeRatingRepository.findByMatchIdAndUserId(matchId, userId);
    }

    public RefereeRating save(RefereeRating refereeRating) {
        return refereeRatingRepository.save(refereeRating);
    }

    public void delete(Integer id) {
        refereeRatingRepository.deleteById(id);
    }

    public Double getAverageRating(Integer matchId) {
        return refereeRatingRepository.findByMatchId(matchId)
                .stream()
                .mapToInt(RefereeRating::getRating)
                .average()
                .orElse(0.0);
    }
}
