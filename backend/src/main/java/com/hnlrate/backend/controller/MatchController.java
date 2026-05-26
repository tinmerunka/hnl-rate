package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.*;
import com.hnlrate.backend.model.*;
import com.hnlrate.backend.repository.MatchPlayerRepository;
import com.hnlrate.backend.repository.MatchRatingVoteRepository;
import com.hnlrate.backend.repository.MatchStatisticsRepository;
import com.hnlrate.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final MatchPlayerRepository matchPlayerRepository;
    private final MatchStatisticsRepository matchStatisticsRepository;
    private final MatchRatingVoteRepository matchRatingVoteRepository;
    private final SyncService syncService;
    private final UserService userService;
    private final PlayerService playerService;
    private final MatchRatingService matchRatingService;
    private final RefereeRatingService refereeRatingService;
    private final AtmosphereRatingService atmosphereRatingService;
    private final PlayerRatingService playerRatingService;

    @GetMapping
    public ResponseEntity<List<MatchDTO>> getAll(
            @RequestParam(required = false) Integer round,
            @RequestParam(required = false) Boolean finished) {

        List<MatchDTO> matches;

        if (round != null) {
            matches = matchService.getByRound(round).stream().map(MatchDTO::new).toList();
        } else if (Boolean.TRUE.equals(finished)) {
            matches = matchService.getFinished().stream().map(MatchDTO::new).toList();
        } else {
            matches = matchService.getAll().stream().map(MatchDTO::new).toList();
        }

        return ResponseEntity.ok(matches);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDTO> getById(@PathVariable Integer id) {
        return matchService.getById(id)
                .map(m -> ResponseEntity.ok(new MatchDTO(m)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/lineup")
    public ResponseEntity<MatchLineupDTO> getLineup(@PathVariable Integer id) {
        Match match = matchService.getById(id).orElse(null);
        if (match == null) return ResponseEntity.notFound().build();

        // Lazy sync: fetch from API if not yet stored and match is finished
        if (!matchPlayerRepository.existsByMatch(match)) {
            if (!Boolean.TRUE.equals(match.getFinished())) {
                return ResponseEntity.noContent().build();
            }
            syncService.syncLineups(match);
        }

        List<MatchPlayer> players = matchPlayerRepository.findByMatch(match);
        if (players.isEmpty()) return ResponseEntity.noContent().build();

        return ResponseEntity.ok(new MatchLineupDTO(match.getHomeClub(), match.getAwayClub(), players));
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<MatchStatisticsDTO> getStatistics(@PathVariable Integer id) {
        Match match = matchService.getById(id).orElse(null);
        if (match == null) return ResponseEntity.notFound().build();

        if (!matchStatisticsRepository.existsByMatch(match)) {
            if (!Boolean.TRUE.equals(match.getFinished())) {
                return ResponseEntity.noContent().build();
            }
            syncService.syncMatchStatistics(match);
        }

        return matchStatisticsRepository.findByMatch(match)
                .map(stats -> ResponseEntity.ok(new MatchStatisticsDTO(match, stats)))
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateMatch(@PathVariable Integer id,
                                        @RequestBody RatingRequestDTO request,
                                        Authentication auth) {
        Match match = matchService.getById(id).orElse(null);
        if (match == null) return ResponseEntity.notFound().build();
        if (!Boolean.TRUE.equals(match.getFinished()))
            return ResponseEntity.badRequest().body("Utakmica još nije završena");
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 10)
            return ResponseEntity.badRequest().body("Ocjena mora biti između 1 i 10");

        User user = userService.getByUsername(auth.getName()).orElseThrow();

        MatchRating rating = matchRatingService.getByMatchAndUser(id, user.getId())
                .orElse(new MatchRating());
        rating.setMatch(match);
        rating.setUser(user);
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());
        rating.setCreatedAt(java.time.LocalDateTime.now());

        matchRatingService.save(rating);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/rate-referee")
    public ResponseEntity<?> rateReferee(@PathVariable Integer id,
                                          @RequestBody RatingRequestDTO request,
                                          Authentication auth) {
        Match match = matchService.getById(id).orElse(null);
        if (match == null) return ResponseEntity.notFound().build();
        if (!Boolean.TRUE.equals(match.getFinished()))
            return ResponseEntity.badRequest().body("Utakmica još nije završena");
        if (match.getReferee() == null)
            return ResponseEntity.badRequest().body("Utakmica nema dodijeljenog suca");
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 10)
            return ResponseEntity.badRequest().body("Ocjena mora biti između 1 i 10");

        User user = userService.getByUsername(auth.getName()).orElseThrow();

        RefereeRating rating = refereeRatingService.getByMatchAndUser(id, user.getId())
                .orElse(new RefereeRating());
        rating.setMatch(match);
        rating.setUser(user);
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());
        rating.setCreatedAt(java.time.LocalDateTime.now());

        refereeRatingService.save(rating);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/rate-atmosphere")
    public ResponseEntity<?> rateAtmosphere(@PathVariable Integer id,
                                             @RequestBody RatingRequestDTO request,
                                             Authentication auth) {
        Match match = matchService.getById(id).orElse(null);
        if (match == null) return ResponseEntity.notFound().build();
        if (!Boolean.TRUE.equals(match.getFinished()))
            return ResponseEntity.badRequest().body("Utakmica još nije završena");
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 10)
            return ResponseEntity.badRequest().body("Ocjena mora biti između 1 i 10");

        User user = userService.getByUsername(auth.getName()).orElseThrow();

        AtmosphereRating rating = atmosphereRatingService.getByMatchAndUser(id, user.getId())
                .orElse(new AtmosphereRating());
        rating.setMatch(match);
        rating.setUser(user);
        rating.setRating(request.getRating());
        rating.setComment(request.getComment());
        rating.setCreatedAt(java.time.LocalDateTime.now());

        atmosphereRatingService.save(rating);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/rate-players")
    public ResponseEntity<?> ratePlayers(@PathVariable Integer id,
                                          @RequestBody List<PlayerRatingRequestDTO> requests,
                                          Authentication auth) {
        Match match = matchService.getById(id).orElse(null);
        if (match == null) return ResponseEntity.notFound().build();
        if (!Boolean.TRUE.equals(match.getFinished()))
            return ResponseEntity.badRequest().body("Utakmica još nije završena");

        User user = userService.getByUsername(auth.getName()).orElseThrow();

        for (PlayerRatingRequestDTO req : requests) {
            if (req.getPlayerId() == null) continue;
            if (req.getRating() == null || req.getRating() < 1 || req.getRating() > 10) continue;

            Player player = playerService.getById(req.getPlayerId()).orElse(null);
            if (player == null) continue;

            PlayerRating rating = playerRatingService.getByPlayerMatchAndUser(req.getPlayerId(), id, user.getId())
                    .orElse(new PlayerRating());
            rating.setPlayer(player);
            rating.setMatch(match);
            rating.setUser(user);
            rating.setRating(req.getRating());
            rating.setComment(req.getComment());
            rating.setBestPlayer(Boolean.TRUE.equals(req.getBestPlayer()));
            rating.setWorstPlayer(Boolean.TRUE.equals(req.getWorstPlayer()));
            rating.setCreatedAt(java.time.LocalDateTime.now());

            playerRatingService.save(rating);
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/ratings")
    public ResponseEntity<MatchRatingsDTO> getRatings(@PathVariable Integer id, Authentication auth) {
        if (matchService.getById(id).isEmpty()) return ResponseEntity.notFound().build();

        List<MatchRating> matchRatings = matchRatingService.getByMatchId(id);
        Double matchAvg = matchRatings.isEmpty() ? null : matchRatings.stream().mapToInt(MatchRating::getRating).average().orElse(0.0);

        List<RefereeRating> refRatings = refereeRatingService.getByMatchId(id);
        Double refAvg = refRatings.isEmpty() ? null : refRatings.stream().mapToInt(RefereeRating::getRating).average().orElse(0.0);

        List<AtmosphereRating> atmRatings = atmosphereRatingService.getByMatchId(id);
        Double atmAvg = atmRatings.isEmpty() ? null : atmRatings.stream().mapToInt(AtmosphereRating::getRating).average().orElse(0.0);

        List<PlayerRating> playerRatings = playerRatingService.getByMatchId(id);
        Map<Integer, List<PlayerRating>> byPlayer = playerRatings.stream()
                .collect(Collectors.groupingBy(r -> r.getPlayer().getId()));

        List<MatchRatingsDTO.PlayerAvg> playerAvgs = byPlayer.entrySet().stream()
                .map(e -> {
                    Player p = e.getValue().get(0).getPlayer();
                    List<PlayerRating> list = e.getValue();
                    double avg = list.stream().mapToInt(PlayerRating::getRating).average().orElse(0.0);
                    long best = list.stream().filter(r -> Boolean.TRUE.equals(r.getBestPlayer())).count();
                    long worst = list.stream().filter(r -> Boolean.TRUE.equals(r.getWorstPlayer())).count();
                    return new MatchRatingsDTO.PlayerAvg(p.getId(), p.getFirstName(), p.getLastName(), avg, list.size(), best, worst);
                })
                .toList();

        User currentUser = auth != null ? userService.getByUsername(auth.getName()).orElse(null) : null;

        List<MatchRating> commentRatings = matchRatings.stream()
                .filter(r -> r.getComment() != null && !r.getComment().isBlank())
                .sorted(Comparator.comparing(MatchRating::getCreatedAt).reversed())
                .toList();

        Map<Integer, Long> upMap = new HashMap<>();
        Map<Integer, Long> downMap = new HashMap<>();
        Map<Integer, String> userVoteMap = new HashMap<>();

        if (!commentRatings.isEmpty()) {
            List<MatchRatingVote> allVotes = matchRatingVoteRepository.findByMatchRatingIn(commentRatings);
            allVotes.stream().filter(v -> v.getVoteType() == VoteType.UP)
                    .collect(Collectors.groupingBy(v -> v.getMatchRating().getId(), Collectors.counting()))
                    .forEach(upMap::put);
            allVotes.stream().filter(v -> v.getVoteType() == VoteType.DOWN)
                    .collect(Collectors.groupingBy(v -> v.getMatchRating().getId(), Collectors.counting()))
                    .forEach(downMap::put);
            if (currentUser != null) {
                matchRatingVoteRepository.findByMatchRatingInAndUser(commentRatings, currentUser)
                        .forEach(v -> userVoteMap.put(v.getMatchRating().getId(), v.getVoteType().name()));
            }
        }

        List<MatchRatingsDTO.MatchComment> comments = commentRatings.stream()
                .map(r -> new MatchRatingsDTO.MatchComment(
                        r.getId(),
                        r.getUser().getUsername(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt().toString(),
                        upMap.getOrDefault(r.getId(), 0L),
                        downMap.getOrDefault(r.getId(), 0L),
                        userVoteMap.getOrDefault(r.getId(), null)
                ))
                .toList();

        Integer userMatchRating = null;
        if (currentUser != null) {
            userMatchRating = matchRatingService.getByMatchAndUser(id, currentUser.getId())
                    .map(MatchRating::getRating)
                    .orElse(null);
        }

        return ResponseEntity.ok(new MatchRatingsDTO(
                matchAvg, matchRatings.size(),
                refAvg, refRatings.size(),
                atmAvg, atmRatings.size(),
                playerAvgs,
                comments,
                userMatchRating
        ));
    }

    @PostMapping("/{matchId}/ratings/{ratingId}/vote")
    public ResponseEntity<?> voteComment(@PathVariable Integer matchId,
                                          @PathVariable Integer ratingId,
                                          @RequestBody VoteRequestDTO request,
                                          Authentication auth) {
        User user = userService.getByUsername(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();

        MatchRating matchRating = matchRatingService.getById(ratingId).orElse(null);
        if (matchRating == null || !matchRating.getMatch().getId().equals(matchId))
            return ResponseEntity.notFound().build();

        if (matchRating.getComment() == null || matchRating.getComment().isBlank())
            return ResponseEntity.badRequest().body("Ovaj komentar ne postoji");

        Optional<MatchRatingVote> existing = matchRatingVoteRepository
                .findByMatchRatingAndUser(matchRating, user);

        if (existing.isPresent()) {
            if (existing.get().getVoteType() == request.getVoteType()) {
                matchRatingVoteRepository.delete(existing.get());
            } else {
                existing.get().setVoteType(request.getVoteType());
                matchRatingVoteRepository.save(existing.get());
            }
        } else {
            MatchRatingVote vote = new MatchRatingVote();
            vote.setMatchRating(matchRating);
            vote.setUser(user);
            vote.setVoteType(request.getVoteType());
            matchRatingVoteRepository.save(vote);
        }

        List<MatchRatingVote> votes = matchRatingVoteRepository.findByMatchRatingIn(List.of(matchRating));
        long upvotes = votes.stream().filter(v -> v.getVoteType() == VoteType.UP).count();
        long downvotes = votes.stream().filter(v -> v.getVoteType() == VoteType.DOWN).count();
        String userVote = matchRatingVoteRepository.findByMatchRatingAndUser(matchRating, user)
                .map(v -> v.getVoteType().name()).orElse(null);

        return ResponseEntity.ok(Map.of(
                "upvotes", upvotes,
                "downvotes", downvotes,
                "userVote", userVote != null ? userVote : ""
        ));
    }
}
