package com.hnlrate.backend.controller;

import com.hnlrate.backend.service.SyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SyncService syncService;

    @PostMapping("/sync/clubs")
    public ResponseEntity<Map<String, Object>> syncClubs() {
        int count = syncService.syncClubs();
        return ResponseEntity.ok(Map.of(
                "poruka", "Sinkronizacija završena",
                "klubova", count
        ));
    }

    @PostMapping("/sync/matches")
    public ResponseEntity<Map<String, Object>> syncMatches() {
        int count = syncService.syncMatches();
        return ResponseEntity.ok(Map.of(
                "poruka", "Sinkronizacija završena",
                "utakmica", count
        ));
    }
}