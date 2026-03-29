package com.hnlrate.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "player")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column
    private String position;

    @Column
    private Integer number;

    @ManyToOne
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;
}
