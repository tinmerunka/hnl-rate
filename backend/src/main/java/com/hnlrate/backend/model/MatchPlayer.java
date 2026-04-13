package com.hnlrate.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "match_player", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"match_id", "player_id"})
})
public class MatchPlayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @ManyToOne
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(nullable = false)
    private Boolean starter;

    @Column
    private String position;

    @Column
    private Integer number;

    // Formation grid position e.g. "2:3" — null for bench players
    @Column
    private String grid;
}
