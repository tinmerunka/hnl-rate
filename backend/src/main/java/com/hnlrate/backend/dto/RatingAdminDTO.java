package com.hnlrate.backend.dto;

import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
public class RatingAdminDTO {
    private Integer id;
    private String username;
    private Integer matchId;
    private String matchLabel;
    private String matchDate;
    private Integer rating;
    private String comment;
    private String createdAt;

    // Used by JPQL constructor expressions — no entity references, no lazy loading
    public RatingAdminDTO(Integer id, String username,
                          Integer matchId, String homeClubName, String awayClubName, Integer round,
                          LocalDate matchDate, Integer rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.matchId = matchId;
        this.matchLabel = homeClubName + " vs " + awayClubName + " · R" + round;
        this.matchDate = matchDate != null ? matchDate.toString() : null;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt != null ? createdAt.toString() : null;
    }
}
