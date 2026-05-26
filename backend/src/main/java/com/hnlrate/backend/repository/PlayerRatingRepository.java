package com.hnlrate.backend.repository;

import com.hnlrate.backend.dto.PlayerRatingAdminDTO;
import com.hnlrate.backend.model.PlayerRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PlayerRatingRepository extends JpaRepository<PlayerRating, Integer> {
    List<PlayerRating> findByMatchId(Integer matchId);
    Optional<PlayerRating> findByPlayerIdAndMatchIdAndUserId(Integer playerId, Integer matchId, Integer userId);
    List<PlayerRating> findByUserId(Integer userId);

    @Query("SELECT new com.hnlrate.backend.dto.PlayerRatingAdminDTO(" +
           "r.id, u.username, m.id, hc.name, ac.name, m.round, m.date, " +
           "p.id, p.firstName, p.lastName, r.rating, r.comment, r.bestPlayer, r.worstPlayer, r.createdAt) " +
           "FROM PlayerRating r JOIN r.user u JOIN r.match m JOIN m.homeClub hc JOIN m.awayClub ac JOIN r.player p " +
           "ORDER BY r.createdAt DESC")
    List<PlayerRatingAdminDTO> findAllAsDTO();
}
