package com.hnlrate.backend.service;

import com.hnlrate.backend.model.MatchRating;
import com.hnlrate.backend.repository.MatchRatingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchRatingServiceTest {

    @Mock MatchRatingRepository matchRatingRepository;

    @InjectMocks MatchRatingService matchRatingService;

    // --- getAverageRating ---

    @Test
    void getAverageRating_vraca0AkoNemaOcjena() {
        when(matchRatingRepository.findByMatchId(1)).thenReturn(List.of());

        assertEquals(0.0, matchRatingService.getAverageRating(1));
    }

    @Test
    void getAverageRating_ispravnoRacunaProsjek() {
        MatchRating r1 = new MatchRating();
        r1.setRating(8);
        MatchRating r2 = new MatchRating();
        r2.setRating(6);

        when(matchRatingRepository.findByMatchId(1)).thenReturn(List.of(r1, r2));

        assertEquals(7.0, matchRatingService.getAverageRating(1));
    }

    @Test
    void getAverageRating_jednaOcjena_vracaTuOcjenu() {
        MatchRating r = new MatchRating();
        r.setRating(9);

        when(matchRatingRepository.findByMatchId(5)).thenReturn(List.of(r));

        assertEquals(9.0, matchRatingService.getAverageRating(5));
    }

    // --- getByMatchAndUser ---

    @Test
    void getByMatchAndUser_delegiraNaRepository() {
        MatchRating rating = new MatchRating();
        when(matchRatingRepository.findByMatchIdAndUserId(1, 2)).thenReturn(Optional.of(rating));

        Optional<MatchRating> result = matchRatingService.getByMatchAndUser(1, 2);

        assertTrue(result.isPresent());
        verify(matchRatingRepository).findByMatchIdAndUserId(1, 2);
    }

    @Test
    void getByMatchAndUser_vracaPrazanOptionalAkoNema() {
        when(matchRatingRepository.findByMatchIdAndUserId(1, 99)).thenReturn(Optional.empty());

        Optional<MatchRating> result = matchRatingService.getByMatchAndUser(1, 99);

        assertFalse(result.isPresent());
    }

    // --- save ---

    @Test
    void save_delegiraNaRepository() {
        MatchRating rating = new MatchRating();
        rating.setRating(7);
        when(matchRatingRepository.save(rating)).thenReturn(rating);

        MatchRating result = matchRatingService.save(rating);

        assertEquals(7, result.getRating());
        verify(matchRatingRepository).save(rating);
    }

    // --- delete ---

    @Test
    void delete_delegiraNaRepository() {
        matchRatingService.delete(42);

        verify(matchRatingRepository).deleteById(42);
    }

    // --- count ---

    @Test
    void count_vrataCorrectanBroj() {
        when(matchRatingRepository.count()).thenReturn(15L);

        assertEquals(15L, matchRatingService.count());
    }
}
