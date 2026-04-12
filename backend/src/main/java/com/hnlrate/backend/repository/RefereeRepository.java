package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Referee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefereeRepository extends JpaRepository<Referee, Integer> {
    Optional<Referee> findByFirstNameAndLastName(String firstName, String lastName);
}
