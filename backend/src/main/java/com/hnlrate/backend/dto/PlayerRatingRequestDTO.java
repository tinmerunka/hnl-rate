package com.hnlrate.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlayerRatingRequestDTO {
    private Integer playerId;
    private Integer rating;
    private String comment;
    private Boolean bestPlayer;
    private Boolean worstPlayer;
}
