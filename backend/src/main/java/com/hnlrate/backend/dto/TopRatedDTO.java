package com.hnlrate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class TopRatedDTO {

    private RatedMatch bestMatch;
    private RatedMatch worstMatch;
    private List<RatedPlayer> topPlayersByPosition;
    private RatedReferee bestReferee;
    private RatedReferee worstReferee;
    private RatedAtmosphere bestAtmosphere;
    private RatedAtmosphere worstAtmosphere;

    @Getter
    @AllArgsConstructor
    public static class RatedMatch {
        private Integer matchId;
        private String homeClub;
        private String awayClub;
        private String result;
        private Integer round;
        private Double avgRating;
        private Integer voteCount;
    }

    @Getter
    @AllArgsConstructor
    public static class RatedPlayer {
        private Integer playerId;
        private String firstName;
        private String lastName;
        private String clubName;
        private String position;
        private Double avgRating;
        private Integer voteCount;
    }

    @Getter
    @AllArgsConstructor
    public static class RatedReferee {
        private Integer refereeId;
        private String firstName;
        private String lastName;
        private Double avgRating;
        private Integer voteCount;
    }

    @Getter
    @AllArgsConstructor
    public static class RatedAtmosphere {
        private Integer matchId;
        private String homeClub;
        private String awayClub;
        private String result;
        private Integer round;
        private Double avgRating;
        private Integer voteCount;
    }
}
