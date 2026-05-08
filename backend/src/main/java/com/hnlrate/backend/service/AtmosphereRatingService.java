package com.hnlrate.backend.service;

import com.hnlrate.backend.dto.RatingAdminDTO;
import com.hnlrate.backend.model.AtmosphereRating;
import com.hnlrate.backend.repository.AtmosphereRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AtmosphereRatingService {

    private final AtmosphereRatingRepository atmosphereRatingRepository;

    public List<RatingAdminDTO> getAllForAdmin() {
        return atmosphereRatingRepository.findAllAsDTO();
    }

    public List<AtmosphereRating> getByMatchId(Integer matchId) {
        return atmosphereRatingRepository.findByMatchId(matchId);
    }

    public Optional<AtmosphereRating> getByMatchAndUser(Integer matchId, Integer userId) {
        return atmosphereRatingRepository.findByMatchIdAndUserId(matchId, userId);
    }

    public AtmosphereRating save(AtmosphereRating atmosphereRating) {
        return atmosphereRatingRepository.save(atmosphereRating);
    }

    public void delete(Integer id) {
        atmosphereRatingRepository.deleteById(id);
    }

    public Double getAverageRating(Integer matchId) {
        return atmosphereRatingRepository.findByMatchId(matchId)
                .stream()
                .mapToInt(AtmosphereRating::getRating)
                .average()
                .orElse(0.0);
    }
}
