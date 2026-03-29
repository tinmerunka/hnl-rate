package com.hnlrate.backend.service;

import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;

    public List<Club> getAll() {
        return clubRepository.findAll();
    }

    public Optional<Club> getById(Integer id) {
        return clubRepository.findById(id);
    }

    public Club save(Club club) {
        return clubRepository.save(club);
    }

    public void delete(Integer id) {
        clubRepository.deleteById(id);
    }
}
