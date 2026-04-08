package com.hnlrate.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "match")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private Integer apiFootballId;

    @ManyToOne
    @JoinColumn(name = "home_club_id", nullable = false)
    private Club homeClub;

    @ManyToOne
    @JoinColumn(name = "away_club_id", nullable = false)
    private Club awayClub;

    @ManyToOne
    @JoinColumn(name = "referee_id")
    private Referee referee;

    @Column(nullable = false)
    private Integer round;

    @Column(nullable = false)
    private LocalDate date;

    @Column
    private String result;

    @Column(nullable = false)
    private Boolean finished = false;
}
