package com.hnlrate.backend.service;

import com.hnlrate.backend.model.Match;
import com.hnlrate.backend.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;

    public List<Match> getAll() {
        return matchRepository.findAll();
    }

    public List<Match> getByRound(Integer round) {
        return matchRepository.findByRound(round);
    }

    public List<Match> getFinished() {
        return matchRepository.findByFinishedTrue();
    }

    public Optional<Match> getById(Integer id) {
        return matchRepository.findById(id);
    }

    public Match save(Match match) {
        return matchRepository.save(match);
    }

    public void delete(Integer id) {
        matchRepository.deleteById(id);
    }
}
