package com.hnlrate.backend.controller;

import com.hnlrate.backend.dto.ClubDTO;
import com.hnlrate.backend.dto.MatchDTO;
import com.hnlrate.backend.dto.UserProfileDTO;
import com.hnlrate.backend.service.ClubService;
import com.hnlrate.backend.service.MatchService;
import com.hnlrate.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;
    private final UserService userService;
    private final MatchService matchService;

    @GetMapping
    public ResponseEntity<List<ClubDTO>> getAll() {
        List<ClubDTO> clubs = clubService.getAll().stream()
                .map(ClubDTO::new)
                .toList();
        return ResponseEntity.ok(clubs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubDTO> getById(@PathVariable Integer id) {
        return clubService.getById(id)
                .map(club -> ResponseEntity.ok(new ClubDTO(club)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<List<MatchDTO>> getMatches(@PathVariable Integer id) {
        return clubService.getById(id)
                .map(club -> ResponseEntity.ok(
                        matchService.getByClub(club).stream()
                                .map(MatchDTO::new)
                                .toList()
                ))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<UserProfileDTO> setFavorite(@PathVariable Integer id, Authentication auth) {
        return ResponseEntity.ok(new UserProfileDTO(userService.setFavoriteClub(auth.getName(), id)));
    }

    @DeleteMapping("/favorite")
    public ResponseEntity<UserProfileDTO> removeFavorite(Authentication auth) {
        return ResponseEntity.ok(new UserProfileDTO(userService.removeFavoriteClub(auth.getName())));
    }
}
