package com.hnlrate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class MyRatingsDTO {
    private Integer matchId;
    private String homeClub;
    private String awayClub;
    private LocalDate date;
    private Integer round;
    private String result;

    private RatingEntry matchRating;
    private RatingEntry refereeRating;
    private RatingEntry atmosphereRating;
    private List<PlayerRatingEntry> playerRatings;

    @Getter
    @AllArgsConstructor
    public static class RatingEntry {
        private Integer rating;
        private String comment;
    }

    @Getter
    @AllArgsConstructor
    public static class PlayerRatingEntry {
        private Integer playerId;
        private String firstName;
        private String lastName;
        private Integer rating;
        private String comment;
        private Boolean bestPlayer;
        private Boolean worstPlayer;
    }
}
