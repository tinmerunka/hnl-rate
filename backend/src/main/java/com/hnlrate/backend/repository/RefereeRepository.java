package com.hnlrate.backend.repository;

import com.hnlrate.backend.model.Referee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RefereeRepository extends JpaRepository<Referee, Integer> {
    Optional<Referee> findByFirstNameAndLastName(String firstName, String lastName);

    @Query("SELECT r FROM Referee r WHERE TRIM(r.firstName) = TRIM(:firstName) AND TRIM(r.lastName) = TRIM(:lastName)")
    Optional<Referee> findByFirstNameAndLastNameTrimmed(@Param("firstName") String firstName, @Param("lastName") String lastName);
}
