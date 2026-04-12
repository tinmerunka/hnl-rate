package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.RefereeDTO;
import com.hnlrate.backend.service.RefereeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/referees")
@RequiredArgsConstructor
public class RefereeController {

    private final RefereeService refereeService;

    @GetMapping
    public ResponseEntity<List<RefereeDTO>> getAll() {
        List<RefereeDTO> referees = refereeService.getAll().stream()
                .map(RefereeDTO::new)
                .toList();
        return ResponseEntity.ok(referees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RefereeDTO> getById(@PathVariable Integer id) {
        return refereeService.getById(id)
                .map(r -> ResponseEntity.ok(new RefereeDTO(r)))
                .orElse(ResponseEntity.notFound().build());
    }
}
