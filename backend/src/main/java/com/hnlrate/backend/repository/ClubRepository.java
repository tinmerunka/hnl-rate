package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClubRepository extends JpaRepository<Club, Integer> {
    Optional<Club> findByApiFootballId(Integer apiFootballId);
}
