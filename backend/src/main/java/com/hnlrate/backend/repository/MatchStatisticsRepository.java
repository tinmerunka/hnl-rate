package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.model.MatchStatistics;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MatchStatisticsRepository extends JpaRepository<MatchStatistics, Integer> {
    boolean existsByMatch(Match match);
    Optional<MatchStatistics> findByMatch(Match match);
}
