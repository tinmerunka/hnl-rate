package com.hnlrate.backend.dto;

import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class PlayerRatingAdminDTO {
    private Integer id;
    private String username;
    private Integer matchId;
    private String matchLabel;
    private String matchDate;
    private Integer playerId;
    private String playerName;
    private Integer rating;
    private String comment;
    private Boolean bestPlayer;
    private Boolean worstPlayer;
    private String createdAt;

    public PlayerRatingAdminDTO(Integer id, String username,
                                Integer matchId, String homeClubName, String awayClubName, Integer round,
                                LocalDate matchDate, Integer playerId, String firstName, String lastName,
                                Integer rating, String comment, Boolean bestPlayer, Boolean worstPlayer,
                                LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.matchId = matchId;
        this.matchLabel = homeClubName + " vs " + awayClubName + " · R" + round;
        this.matchDate = matchDate != null ? matchDate.toString() : null;
        this.playerId = playerId;
        this.playerName = firstName + " " + lastName;
        this.rating = rating;
        this.comment = comment;
        this.bestPlayer = bestPlayer;
        this.worstPlayer = worstPlayer;
        this.createdAt = createdAt != null ? createdAt.toString() : null;
    }
}
