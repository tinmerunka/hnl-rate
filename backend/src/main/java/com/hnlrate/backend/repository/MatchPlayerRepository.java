package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.model.MatchPlayer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchPlayerRepository extends JpaRepository<MatchPlayer, Integer> {
    List<MatchPlayer> findByMatch(Match match);
    boolean existsByMatch(Match match);
    void deleteByMatch(Match match);
}
