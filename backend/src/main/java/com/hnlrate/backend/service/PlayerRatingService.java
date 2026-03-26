package com.hnlrate.backend.service;

import com.hnlrate.backend.model.PlayerRating;
import com.hnlrate.backend.repository.PlayerRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlayerRatingService {

    private final PlayerRatingRepository playerRatingRepository;

    public List<PlayerRating> getByMatchId(Integer matchId) {
        return playerRatingRepository.findByMatchId(matchId);
    }

    public Optional<PlayerRating> getByPlayerMatchAndUser(Integer playerId, Integer matchId, Integer userId) {
        return playerRatingRepository.findByPlayerIdAndMatchIdAndUserId(playerId, matchId, userId);
    }

    public PlayerRating save(PlayerRating playerRating) {
        return playerRatingRepository.save(playerRating);
    }

    public void delete(Integer id) {
        playerRatingRepository.deleteById(id);
    }

    public Double getAverageRating(Integer playerId, Integer matchId) {
        return playerRatingRepository.findByMatchId(matchId)
                .stream()
                .filter(r -> r.getPlayer().getId().equals(playerId))
                .mapToInt(PlayerRating::getRating)
                .average()
                .orElse(0.0);
    }
}
