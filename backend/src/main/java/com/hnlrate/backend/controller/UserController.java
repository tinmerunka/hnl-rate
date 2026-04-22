package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.MyRatingsDTO;
import com.hnlrate.backend.dto.UserProfileDTO;
import com.hnlrate.backend.model.*;
import com.hnlrate.backend.repository.*;
import com.hnlrate.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final MatchRatingRepository matchRatingRepository;
    private final RefereeRatingRepository refereeRatingRepository;
    private final AtmosphereRatingRepository atmosphereRatingRepository;
    private final PlayerRatingRepository playerRatingRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMe(Authentication auth) {
        return userService.getByUsername(auth.getName())
                .map(user -> ResponseEntity.ok(new UserProfileDTO(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ratings")
    public ResponseEntity<List<MyRatingsDTO>> getMyRatings(Authentication auth) {
        User user = userService.getByUsername(auth.getName()).orElseThrow();
        Integer userId = user.getId();

        Map<Integer, MatchRating> matchRatings = matchRatingRepository.findByUserId(userId)
                .stream().collect(Collectors.toMap(r -> r.getMatch().getId(), r -> r));

        Map<Integer, RefereeRating> refRatings = refereeRatingRepository.findByUserId(userId)
                .stream().collect(Collectors.toMap(r -> r.getMatch().getId(), r -> r));

        Map<Integer, AtmosphereRating> atmRatings = atmosphereRatingRepository.findByUserId(userId)
                .stream().collect(Collectors.toMap(r -> r.getMatch().getId(), r -> r));

        Map<Integer, List<PlayerRating>> playerRatings = playerRatingRepository.findByUserId(userId)
                .stream().collect(Collectors.groupingBy(r -> r.getMatch().getId()));

        Set<Integer> matchIds = new HashSet<>();
        matchIds.addAll(matchRatings.keySet());
        matchIds.addAll(refRatings.keySet());
        matchIds.addAll(atmRatings.keySet());
        matchIds.addAll(playerRatings.keySet());

        // Collect match entity from any available rating
        Map<Integer, Match> matches = new HashMap<>();
        matchRatings.values().forEach(r -> matches.put(r.getMatch().getId(), r.getMatch()));
        refRatings.values().forEach(r -> matches.putIfAbsent(r.getMatch().getId(), r.getMatch()));
        atmRatings.values().forEach(r -> matches.putIfAbsent(r.getMatch().getId(), r.getMatch()));
        playerRatings.values().stream().flatMap(List::stream)
                .forEach(r -> matches.putIfAbsent(r.getMatch().getId(), r.getMatch()));

        List<MyRatingsDTO> result = matchIds.stream()
                .sorted(Comparator.comparingInt(id -> -matches.get(id).getId()))
                .map(matchId -> {
                    Match m = matches.get(matchId);

                    MatchRating mr = matchRatings.get(matchId);
                    RefereeRating rr = refRatings.get(matchId);
                    AtmosphereRating ar = atmRatings.get(matchId);

                    List<MyRatingsDTO.PlayerRatingEntry> players = playerRatings
                            .getOrDefault(matchId, List.of())
                            .stream()
                            .map(pr -> new MyRatingsDTO.PlayerRatingEntry(
                                    pr.getPlayer().getId(),
                                    pr.getPlayer().getFirstName(),
                                    pr.getPlayer().getLastName(),
                                    pr.getRating(),
                                    pr.getComment(),
                                    pr.getBestPlayer(),
                                    pr.getWorstPlayer()
                            ))
                            .toList();

                    return new MyRatingsDTO(
                            m.getId(),
                            m.getHomeClub().getName(),
                            m.getAwayClub().getName(),
                            m.getDate(),
                            m.getRound(),
                            m.getResult(),
                            mr != null ? new MyRatingsDTO.RatingEntry(mr.getRating(), mr.getComment()) : null,
                            rr != null ? new MyRatingsDTO.RatingEntry(rr.getRating(), rr.getComment()) : null,
                            ar != null ? new MyRatingsDTO.RatingEntry(ar.getRating(), ar.getComment()) : null,
                            players
                    );
                })
                .toList();

        return ResponseEntity.ok(result);
    }
}
