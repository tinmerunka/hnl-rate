package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.MatchDTO;
import com.hnlrate.backend.dto.MatchLineupDTO;
import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.model.MatchPlayer;
import com.hnlrate.backend.repository.MatchPlayerRepository;
import com.hnlrate.backend.service.MatchService;
import com.hnlrate.backend.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final MatchPlayerRepository matchPlayerRepository;
    private final SyncService syncService;

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
}
