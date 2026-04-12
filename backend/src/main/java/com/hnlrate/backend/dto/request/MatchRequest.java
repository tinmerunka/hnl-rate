package com.hnlrate.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class MatchRequest {
    private Integer homeClubId;
    private Integer awayClubId;
    private Integer refereeId;
    private Integer round;
    private LocalDate date;
    private String result;
    private Boolean finished;
}
