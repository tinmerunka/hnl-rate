package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.PlayerDTO;
import com.hnlrate.backend.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping
    public ResponseEntity<List<PlayerDTO>> getAll(
            @RequestParam(required = false) Integer clubId) {

        List<PlayerDTO> players = (clubId != null)
                ? playerService.getByClubId(clubId).stream().map(PlayerDTO::new).toList()
                : playerService.getAll().stream().map(PlayerDTO::new).toList();

        return ResponseEntity.ok(players);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerDTO> getById(@PathVariable Integer id) {
        return playerService.getById(id)
                .map(p -> ResponseEntity.ok(new PlayerDTO(p)))
                .orElse(ResponseEntity.notFound().build());
    }
}
