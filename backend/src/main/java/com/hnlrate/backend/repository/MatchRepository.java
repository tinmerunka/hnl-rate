package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MatchRepository extends JpaRepository<Match, Integer> {
    List<Match> findByRound(Integer round);
    List<Match> findByFinishedTrue();
    Optional<Match> findByApiFootballId(Integer apiFootballId);
    List<Match> findByHomeClubOrAwayClubOrderByDateAsc(Club homeClub, Club awayClub);
}
