package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.model.MatchStatistics;
import lombok.Getter;

@Getter
public class MatchStatisticsDTO {

    private final TeamInfo homeTeam;
    private final TeamInfo awayTeam;

    private final StatPair shotsOnGoal;
    private final StatPair shotsOffGoal;
    private final StatPair totalShots;
    private final StatPair blockedShots;
    private final StatPair shotsInsidebox;
    private final StatPair shotsOutsidebox;
    private final StatPair fouls;
    private final StatPair cornerKicks;
    private final StatPair offsides;
    private final StatPair ballPossession;
    private final StatPair yellowCards;
    private final StatPair redCards;
    private final StatPair goalkeeperSaves;
    private final StatPair totalPasses;
    private final StatPair passesAccurate;
    private final StatPair passesPercent;

    public MatchStatisticsDTO(Match match, MatchStatistics s) {
        this.homeTeam = new TeamInfo(match.getHomeClub().getName(), match.getHomeClub().getLogoUrl());
        this.awayTeam = new TeamInfo(match.getAwayClub().getName(), match.getAwayClub().getLogoUrl());

        this.shotsOnGoal     = new StatPair(s.getHomeShotsOnGoal(),     s.getAwayShotsOnGoal());
        this.shotsOffGoal    = new StatPair(s.getHomeShotsOffGoal(),    s.getAwayShotsOffGoal());
        this.totalShots      = new StatPair(s.getHomeTotalShots(),      s.getAwayTotalShots());
        this.blockedShots    = new StatPair(s.getHomeBlockedShots(),    s.getAwayBlockedShots());
        this.shotsInsidebox  = new StatPair(s.getHomeShotsInsidebox(),  s.getAwayShotsInsidebox());
        this.shotsOutsidebox = new StatPair(s.getHomeShotsOutsidebox(), s.getAwayShotsOutsidebox());
        this.fouls           = new StatPair(s.getHomeFouls(),           s.getAwayFouls());
        this.cornerKicks     = new StatPair(s.getHomeCornerKicks(),     s.getAwayCornerKicks());
        this.offsides        = new StatPair(s.getHomeOffsides(),        s.getAwayOffsides());
        this.ballPossession  = new StatPair(s.getHomeBallPossession(),  s.getAwayBallPossession());
        this.yellowCards     = new StatPair(s.getHomeYellowCards(),     s.getAwayYellowCards());
        this.redCards        = new StatPair(s.getHomeRedCards(),        s.getAwayRedCards());
        this.goalkeeperSaves = new StatPair(s.getHomeGoalkeeperSaves(), s.getAwayGoalkeeperSaves());
        this.totalPasses     = new StatPair(s.getHomeTotalPasses(),     s.getAwayTotalPasses());
        this.passesAccurate  = new StatPair(s.getHomePassesAccurate(),  s.getAwayPassesAccurate());
        this.passesPercent   = new StatPair(s.getHomePassesPercent(),   s.getAwayPassesPercent());
    }

    public record TeamInfo(String name, String logoUrl) {}
    public record StatPair(Integer home, Integer away) {}
}
