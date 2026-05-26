package com.hnlrate.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "match_statistics")
public class MatchStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "match_id", nullable = false, unique = true)
    private Match match;

    private Integer homeShotsOnGoal;
    private Integer awayShotsOnGoal;
    private Integer homeShotsOffGoal;
    private Integer awayShotsOffGoal;
    private Integer homeTotalShots;
    private Integer awayTotalShots;
    private Integer homeBlockedShots;
    private Integer awayBlockedShots;
    private Integer homeShotsInsidebox;
    private Integer awayShotsInsidebox;
    private Integer homeShotsOutsidebox;
    private Integer awayShotsOutsidebox;

    private Integer homeFouls;
    private Integer awayFouls;
    private Integer homeCornerKicks;
    private Integer awayCornerKicks;
    private Integer homeOffsides;
    private Integer awayOffsides;
    private Integer homeYellowCards;
    private Integer awayYellowCards;
    private Integer homeRedCards;
    private Integer awayRedCards;

    private Integer homeGoalkeeperSaves;
    private Integer awayGoalkeeperSaves;
    private Integer homeTotalPasses;
    private Integer awayTotalPasses;
    private Integer homePassesAccurate;
    private Integer awayPassesAccurate;
    private Integer homePassesPercent;
    private Integer awayPassesPercent;
    private Integer homeBallPossession;
    private Integer awayBallPossession;
}
