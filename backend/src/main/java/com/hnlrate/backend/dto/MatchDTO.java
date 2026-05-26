package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.Match;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class MatchDTO {

    private final Integer id;
    private final ClubDTO homeClub;
    private final ClubDTO awayClub;
    private final RefereeDTO referee;
    private final Integer round;
    private final LocalDate date;
    private final String result;
    private final Boolean finished;

    public MatchDTO(Match match) {
        this.id = match.getId();
        this.homeClub = new ClubDTO(match.getHomeClub());
        this.awayClub = new ClubDTO(match.getAwayClub());
        this.referee = match.getReferee() != null ? new RefereeDTO(match.getReferee()) : null;
        this.round = match.getRound();
        this.date = match.getDate();
        this.result = match.getResult();
        this.finished = match.getFinished();
    }
}
