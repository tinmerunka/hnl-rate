package com.hnlrate.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "referee")
public class Referee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = true)
    private Integer apiFootballId;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;
}
