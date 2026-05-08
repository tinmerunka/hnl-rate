package com.hnlrate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MatchRatingsDTO {
    private Double averageMatchRating;
    private Integer matchCount;
    private Double averageRefereeRating;
    private Integer refereeCount;
    private Double averageAtmosphereRating;
    private Integer atmosphereCount;
    private List<PlayerAvg> playerRatings;
    private List<MatchComment> comments;
    private Integer userMatchRating;

    @Getter
    @AllArgsConstructor
    public static class PlayerAvg {
        private Integer playerId;
        private String firstName;
        private String lastName;
        private Double averageRating;
        private Integer ratingCount;
        private Long bestPlayerVotes;
        private Long worstPlayerVotes;
    }

    @Getter
    @AllArgsConstructor
    public static class MatchComment {
        private String username;
        private Integer rating;
        private String comment;
        private String createdAt;
    }
}
