package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.MatchDTO;
import com.hnlrate.backend.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

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
}
