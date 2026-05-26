package com.hnlrate.backend.repository;

import com.hnlrate.backend.dto.RatingAdminDTO;
import com.hnlrate.backend.model.RefereeRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RefereeRatingRepository extends JpaRepository<RefereeRating, Integer> {

    List<RefereeRating> findByMatchId(Integer matchId);
    Optional<RefereeRating> findByMatchIdAndUserId(Integer matchId, Integer userId);
    List<RefereeRating> findByUserId(Integer userId);

    @Query("SELECT new com.hnlrate.backend.dto.RatingAdminDTO(" +
           "r.id, u.username, m.id, hc.name, ac.name, m.round, m.date, r.rating, r.comment, r.createdAt) " +
           "FROM RefereeRating r JOIN r.user u JOIN r.match m JOIN m.homeClub hc JOIN m.awayClub ac " +
           "ORDER BY r.createdAt DESC")
    List<RatingAdminDTO> findAllAsDTO();
}
