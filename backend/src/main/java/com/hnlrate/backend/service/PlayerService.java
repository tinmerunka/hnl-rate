package com.hnlrate.backend.service;

import com.hnlrate.backend.model.Player;
import com.hnlrate.backend.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlayerService {
    private final PlayerRepository playerRepository;

    public List<Player> getAll() {
        return playerRepository.findAll();
    }

    public List<Player> getByClubId(Integer clubId) {
        return playerRepository.findByClubId(clubId);
    }

    public Optional<Player> getById(Integer id) {
        return playerRepository.findById(id);
    }

    public Player save(Player player) {
        return playerRepository.save(player);
    }

    public void delete(Integer id) {
        playerRepository.deleteById(id);
    }
}
