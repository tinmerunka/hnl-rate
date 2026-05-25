package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.ClubDTO;
import com.hnlrate.backend.dto.CommentAdminDTO;
import com.hnlrate.backend.dto.MatchDTO;
import com.hnlrate.backend.dto.PlayerRatingAdminDTO;
import com.hnlrate.backend.dto.RatingAdminDTO;
import com.hnlrate.backend.dto.PlayerDTO;
import com.hnlrate.backend.dto.RefereeDTO;
import com.hnlrate.backend.dto.UserAdminDTO;
import com.hnlrate.backend.dto.request.ClubRequest;
import com.hnlrate.backend.dto.request.MatchRequest;
import com.hnlrate.backend.dto.request.PlayerRequest;
import com.hnlrate.backend.dto.request.RefereeRequest;
import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.model.MatchRating;
import com.hnlrate.backend.model.Player;
import com.hnlrate.backend.model.Referee;
import com.hnlrate.backend.model.User;
import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SyncService syncService;
    private final ClubService clubService;
    private final MatchService matchService;
    private final NotificationService notificationService;
    private final PlayerService playerService;
    private final RefereeService refereeService;
    private final UserService userService;
    private final MatchRatingService matchRatingService;
    private final RefereeRatingService refereeRatingService;
    private final AtmosphereRatingService atmosphereRatingService;
    private final PlayerRatingService playerRatingService;
    private final RefreshTokenService refreshTokenService;

    // ── Sync ────────────────────────────────────────────────────────────────

    @PostMapping("/sync/clubs")
    public ResponseEntity<Map<String, Object>> syncClubs() {
        int count = syncService.syncClubs();
        return ResponseEntity.ok(Map.of("poruka", "Sinkronizacija završena", "klubova", count));
    }

    @PostMapping("/sync/matches")
    public ResponseEntity<Map<String, Object>> syncMatches() {
        int count = syncService.syncMatches();
        return ResponseEntity.ok(Map.of("poruka", "Sinkronizacija završena", "utakmica", count));
    }

    @PostMapping("/sync/players")
    public ResponseEntity<Map<String, Object>> syncPlayers() {
        int count = syncService.syncPlayers();
        return ResponseEntity.ok(Map.of("poruka", "Sinkronizacija završena", "igraca", count));
    }

    // ── Clubs ────────────────────────────────────────────────────────────────

    @PostMapping("/clubs")
    public ResponseEntity<ClubDTO> createClub(@RequestBody ClubRequest req) {
        Club club = new Club();
        club.setName(req.getName());
        club.setCity(req.getCity());
        club.setLogoUrl(req.getLogoUrl());
        return ResponseEntity.ok(new ClubDTO(clubService.save(club)));
    }

    @PutMapping("/clubs/{id}")
    public ResponseEntity<ClubDTO> updateClub(@PathVariable Integer id, @RequestBody ClubRequest req) {
        Club club = clubService.getById(id)
                .orElseThrow(() -> new RuntimeException("Klub nije pronađen"));
        if (req.getName() != null) club.setName(req.getName());
        if (req.getCity() != null) club.setCity(req.getCity());
        if (req.getLogoUrl() != null) club.setLogoUrl(req.getLogoUrl());
        return ResponseEntity.ok(new ClubDTO(clubService.save(club)));
    }

    @DeleteMapping("/clubs/{id}")
    public ResponseEntity<Void> deleteClub(@PathVariable Integer id) {
        clubService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Matches ──────────────────────────────────────────────────────────────

    @PostMapping("/matches")
    public ResponseEntity<MatchDTO> createMatch(@RequestBody MatchRequest req) {
        Club home = clubService.getById(req.getHomeClubId())
                .orElseThrow(() -> new RuntimeException("Domaćin nije pronađen"));
        Club away = clubService.getById(req.getAwayClubId())
                .orElseThrow(() -> new RuntimeException("Gost nije pronađen"));

        Match match = new Match();
        match.setHomeClub(home);
        match.setAwayClub(away);
        match.setRound(req.getRound());
        match.setDate(req.getDate());
        match.setResult(req.getResult());
        match.setFinished(req.getFinished() != null ? req.getFinished() : false);

        if (req.getRefereeId() != null) {
            refereeService.getById(req.getRefereeId()).ifPresent(match::setReferee);
        }

        return ResponseEntity.ok(new MatchDTO(matchService.save(match)));
    }

    @PutMapping("/matches/{id}")
    public ResponseEntity<MatchDTO> updateMatch(@PathVariable Integer id, @RequestBody MatchRequest req) {
        Match match = matchService.getById(id)
                .orElseThrow(() -> new RuntimeException("Utakmica nije pronađena"));

        if (req.getHomeClubId() != null) {
            clubService.getById(req.getHomeClubId()).ifPresent(match::setHomeClub);
        }
        if (req.getAwayClubId() != null) {
            clubService.getById(req.getAwayClubId()).ifPresent(match::setAwayClub);
        }
        if (req.getRefereeId() != null) {
            refereeService.getById(req.getRefereeId()).ifPresent(match::setReferee);
        }
        if (req.getRound() != null) match.setRound(req.getRound());
        if (req.getDate() != null) match.setDate(req.getDate());
        if (req.getResult() != null) match.setResult(req.getResult());
        boolean wasFinished = Boolean.TRUE.equals(match.getFinished());
        if (req.getFinished() != null) match.setFinished(req.getFinished());

        Match saved = matchService.save(match);

        if (!wasFinished && Boolean.TRUE.equals(saved.getFinished())) {
            notificationService.sendMatchFinishedNotification(saved);
        }

        return ResponseEntity.ok(new MatchDTO(saved));
    }

    @DeleteMapping("/matches/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Integer id) {
        matchService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Players ──────────────────────────────────────────────────────────────

    @PostMapping("/players")
    public ResponseEntity<PlayerDTO> createPlayer(@RequestBody PlayerRequest req) {
        Club club = clubService.getById(req.getClubId())
                .orElseThrow(() -> new RuntimeException("Klub nije pronađen"));

        Player player = new Player();
        player.setFirstName(req.getFirstName());
        player.setLastName(req.getLastName());
        player.setPosition(req.getPosition());
        player.setNumber(req.getNumber());
        player.setClub(club);

        return ResponseEntity.ok(new PlayerDTO(playerService.save(player)));
    }

    @PutMapping("/players/{id}")
    public ResponseEntity<PlayerDTO> updatePlayer(@PathVariable Integer id, @RequestBody PlayerRequest req) {
        Player player = playerService.getById(id)
                .orElseThrow(() -> new RuntimeException("Igrač nije pronađen"));

        if (req.getFirstName() != null) player.setFirstName(req.getFirstName());
        if (req.getLastName() != null) player.setLastName(req.getLastName());
        if (req.getPosition() != null) player.setPosition(req.getPosition());
        if (req.getNumber() != null) player.setNumber(req.getNumber());
        if (req.getClubId() != null) {
            clubService.getById(req.getClubId()).ifPresent(player::setClub);
        }

        return ResponseEntity.ok(new PlayerDTO(playerService.save(player)));
    }

    @DeleteMapping("/players/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Integer id) {
        playerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Referees ─────────────────────────────────────────────────────────────

    @PostMapping("/referees")
    public ResponseEntity<RefereeDTO> createReferee(@RequestBody RefereeRequest req) {
        Referee referee = new Referee();
        referee.setFirstName(req.getFirstName());
        referee.setLastName(req.getLastName());
        return ResponseEntity.ok(new RefereeDTO(refereeService.save(referee)));
    }

    @PutMapping("/referees/{id}")
    public ResponseEntity<RefereeDTO> updateReferee(@PathVariable Integer id, @RequestBody RefereeRequest req) {
        Referee referee = refereeService.getById(id)
                .orElseThrow(() -> new RuntimeException("Sudac nije pronađen"));
        if (req.getFirstName() != null) referee.setFirstName(req.getFirstName());
        if (req.getLastName() != null) referee.setLastName(req.getLastName());
        return ResponseEntity.ok(new RefereeDTO(refereeService.save(referee)));
    }

    @DeleteMapping("/referees/{id}")
    public ResponseEntity<Void> deleteReferee(@PathVariable Integer id) {
        refereeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<List<UserAdminDTO>> getUsers() {
        return ResponseEntity.ok(userService.getAll().stream().map(UserAdminDTO::new).toList());
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<UserAdminDTO> blockUser(
            @PathVariable Integer id,
            @RequestBody Map<String, Boolean> body) {
        User user = userService.getById(id)
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));
        Boolean blocked = body.get("blocked");
        user.setBlocked(blocked != null ? blocked : !user.getBlocked());
        return ResponseEntity.ok(new UserAdminDTO(userService.save(user)));
    }

    // ── Comments ─────────────────────────────────────────────────────────────

    @GetMapping("/comments")
    public ResponseEntity<List<CommentAdminDTO>> getComments() {
        return ResponseEntity.ok(matchRatingService.getAllWithComments());
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Integer id) {
        MatchRating rating = matchRatingService.getById(id)
                .orElseThrow(() -> new RuntimeException("Komentar nije pronađen"));
        rating.setComment(null);
        matchRatingService.save(rating);
        return ResponseEntity.noContent().build();
    }

    // ── Ratings ──────────────────────────────────────────────────────────────

    @GetMapping("/ratings")
    public ResponseEntity<List<RatingAdminDTO>> getAllRatings() {
        return ResponseEntity.ok(matchRatingService.getAllForAdmin());
    }

    @GetMapping("/referee-ratings")
    public ResponseEntity<List<RatingAdminDTO>> getAllRefereeRatings() {
        return ResponseEntity.ok(refereeRatingService.getAllForAdmin());
    }

    @GetMapping("/atmosphere-ratings")
    public ResponseEntity<List<RatingAdminDTO>> getAllAtmosphereRatings() {
        return ResponseEntity.ok(atmosphereRatingService.getAllForAdmin());
    }

    @DeleteMapping("/referee-ratings/{id}")
    public ResponseEntity<Void> deleteRefereeRating(@PathVariable Integer id) {
        refereeRatingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/atmosphere-ratings/{id}")
    public ResponseEntity<Void> deleteAtmosphereRating(@PathVariable Integer id) {
        atmosphereRatingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/player-ratings")
    public ResponseEntity<List<PlayerRatingAdminDTO>> getAllPlayerRatings() {
        return ResponseEntity.ok(playerRatingService.getAllForAdmin());
    }

    @DeleteMapping("/player-ratings/{id}")
    public ResponseEntity<Void> deletePlayerRating(@PathVariable Integer id) {
        playerRatingService.getById(id)
                .orElseThrow(() -> new RuntimeException("Ocjena igrača nije pronađena"));
        playerRatingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/ratings/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable Integer id) {
        matchRatingService.getById(id)
                .orElseThrow(() -> new RuntimeException("Ocjena nije pronađena"));
        matchRatingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Stats ─────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalRatings = matchRatingService.count() + refereeRatingService.count()
                + atmosphereRatingService.count() + playerRatingService.count();
        return ResponseEntity.ok(Map.of(
                "activeSessions", refreshTokenService.countActiveSessions(),
                "totalUsers", userService.count(),
                "totalRatings", totalRatings
        ));
    }
}
