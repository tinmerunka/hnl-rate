package com.hnlrate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MatchRatingsDTO {
    private Double matchAvg;
    private Integer matchCount;
    private Double refereeAvg;
    private Integer refereeCount;
    private Double atmosphereAvg;
    private Integer atmosphereCount;
    private List<PlayerAvg> players;

    @Getter
    @AllArgsConstructor
    public static class PlayerAvg {
        private Integer playerId;
        private String firstName;
        private String lastName;
        private Double avgRating;
        private Integer ratingCount;
        private Long bestPlayerVotes;
        private Long worstPlayerVotes;
    }
}
