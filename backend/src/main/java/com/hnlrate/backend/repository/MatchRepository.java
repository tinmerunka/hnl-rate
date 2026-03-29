package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchRepository extends JpaRepository<Match,Integer> {
    List<Match> findByRound(Integer round);
    List<Match> findByFinishedTrue();
}
