package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.TopRatedDTO;
import com.hnlrate.backend.model.*;
import com.hnlrate.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/top-rated")
@RequiredArgsConstructor
public class TopRatedController {

    private final MatchRatingRepository matchRatingRepository;
    private final PlayerRatingRepository playerRatingRepository;
    private final RefereeRatingRepository refereeRatingRepository;
    private final AtmosphereRatingRepository atmosphereRatingRepository;

    private static final int MIN_VOTES = 1;
    private static final List<String> POSITIONS = List.of("Goalkeeper", "Defender", "Midfielder", "Attacker");

    @GetMapping
    public ResponseEntity<TopRatedDTO> getTopRated() {

        // --- Matches ---
        Map<Integer, List<MatchRating>> byMatch = matchRatingRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getMatch().getId()));

        List<Map.Entry<TopRatedDTO.RatedMatch, Double>> matchAvgs = byMatch.entrySet().stream()
                .filter(e -> e.getValue().size() >= MIN_VOTES)
                .map(e -> {
                    Match m = e.getValue().get(0).getMatch();
                    double avg = round1(e.getValue().stream().mapToInt(MatchRating::getRating).average().orElse(0));
                    return Map.entry(new TopRatedDTO.RatedMatch(
                            m.getId(), m.getHomeClub().getName(), m.getAwayClub().getName(),
                            m.getResult(), m.getRound(), avg, e.getValue().size()), avg);
                })
                .sorted(Map.Entry.<TopRatedDTO.RatedMatch, Double>comparingByValue().reversed())
                .toList();

        TopRatedDTO.RatedMatch bestMatch  = matchAvgs.isEmpty() ? null : matchAvgs.get(0).getKey();
        TopRatedDTO.RatedMatch worstMatch = matchAvgs.isEmpty() ? null : matchAvgs.get(matchAvgs.size() - 1).getKey();

        // --- Players by position ---
        Map<Integer, List<PlayerRating>> byPlayer = playerRatingRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getPlayer().getId()));

        List<TopRatedDTO.RatedPlayer> topByPosition = POSITIONS.stream()
                .map(pos -> byPlayer.entrySet().stream()
                        .filter(e -> e.getValue().size() >= MIN_VOTES)
                        .filter(e -> pos.equals(e.getValue().get(0).getPlayer().getPosition()))
                        .map(e -> {
                            Player p = e.getValue().get(0).getPlayer();
                            double avg = round1(e.getValue().stream().mapToInt(PlayerRating::getRating).average().orElse(0));
                            return Map.entry(new TopRatedDTO.RatedPlayer(
                                    p.getId(), p.getFirstName(), p.getLastName(),
                                    p.getClub().getName(), pos, avg, e.getValue().size()), avg);
                        })
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse(null))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // --- Referees ---
        Map<Integer, List<RefereeRating>> byRef = refereeRatingRepository.findAll().stream()
                .filter(r -> r.getMatch().getReferee() != null)
                .collect(Collectors.groupingBy(r -> r.getMatch().getReferee().getId()));

        List<Map.Entry<TopRatedDTO.RatedReferee, Double>> refAvgs = byRef.entrySet().stream()
                .filter(e -> e.getValue().size() >= MIN_VOTES)
                .map(e -> {
                    Referee ref = e.getValue().get(0).getMatch().getReferee();
                    double avg = round1(e.getValue().stream().mapToInt(RefereeRating::getRating).average().orElse(0));
                    return Map.entry(new TopRatedDTO.RatedReferee(
                            ref.getId(), ref.getFirstName(), ref.getLastName(), avg, e.getValue().size()), avg);
                })
                .sorted(Map.Entry.<TopRatedDTO.RatedReferee, Double>comparingByValue().reversed())
                .toList();

        TopRatedDTO.RatedReferee bestReferee  = refAvgs.isEmpty() ? null : refAvgs.get(0).getKey();
        TopRatedDTO.RatedReferee worstReferee = refAvgs.isEmpty() ? null : refAvgs.get(refAvgs.size() - 1).getKey();

        // --- Atmosphere ---
        Map<Integer, List<AtmosphereRating>> byMatchAtm = atmosphereRatingRepository.findAll().stream()
                .collect(Collectors.groupingBy(r -> r.getMatch().getId()));

        List<Map.Entry<TopRatedDTO.RatedAtmosphere, Double>> atmAvgs = byMatchAtm.entrySet().stream()
                .filter(e -> e.getValue().size() >= MIN_VOTES)
                .map(e -> {
                    Match m = e.getValue().get(0).getMatch();
                    double avg = round1(e.getValue().stream().mapToInt(AtmosphereRating::getRating).average().orElse(0));
                    return Map.entry(new TopRatedDTO.RatedAtmosphere(
                            m.getId(), m.getHomeClub().getName(), m.getAwayClub().getName(),
                            m.getResult(), m.getRound(), avg, e.getValue().size()), avg);
                })
                .sorted(Map.Entry.<TopRatedDTO.RatedAtmosphere, Double>comparingByValue().reversed())
                .toList();

        TopRatedDTO.RatedAtmosphere bestAtmosphere  = atmAvgs.isEmpty() ? null : atmAvgs.get(0).getKey();
        TopRatedDTO.RatedAtmosphere worstAtmosphere = atmAvgs.isEmpty() ? null : atmAvgs.get(atmAvgs.size() - 1).getKey();

        return ResponseEntity.ok(new TopRatedDTO(
                bestMatch, worstMatch,
                topByPosition,
                bestReferee, worstReferee,
                bestAtmosphere, worstAtmosphere));
    }

    private static double round1(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
