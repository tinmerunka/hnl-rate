package com.hnlrate.backend.repository;

import com.hnlrate.backend.dto.CommentAdminDTO;
import com.hnlrate.backend.dto.RatingAdminDTO;
import com.hnlrate.backend.model.MatchRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MatchRatingRepository extends JpaRepository<MatchRating, Integer> {

    List<MatchRating> findByMatchId(Integer matchId);
    Optional<MatchRating> findByMatchIdAndUserId(Integer matchId, Integer userId);
    List<MatchRating> findByUserId(Integer userId);

    @Query("SELECT new com.hnlrate.backend.dto.RatingAdminDTO(" +
           "r.id, u.username, m.id, hc.name, ac.name, m.round, m.date, r.rating, r.comment, r.createdAt) " +
           "FROM MatchRating r JOIN r.user u JOIN r.match m JOIN m.homeClub hc JOIN m.awayClub ac " +
           "ORDER BY r.createdAt DESC")
    List<RatingAdminDTO> findAllAsDTO();

    @Query("SELECT new com.hnlrate.backend.dto.CommentAdminDTO(" +
           "r.id, u.username, m.id, hc.name, ac.name, m.round, m.date, r.rating, r.comment, r.createdAt) " +
           "FROM MatchRating r JOIN r.user u JOIN r.match m JOIN m.homeClub hc JOIN m.awayClub ac " +
           "WHERE r.comment IS NOT NULL AND r.comment <> '' ORDER BY r.createdAt DESC")
    List<CommentAdminDTO> findAllCommentsAsDTO();
}
