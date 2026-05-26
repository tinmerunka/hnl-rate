package com.hnlrate.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "match_rating_vote",
        uniqueConstraints = @UniqueConstraint(columnNames = {"match_rating_id", "user_id"}))
public class MatchRatingVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "match_rating_id", nullable = false)
    private MatchRating matchRating;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoteType voteType;
}
