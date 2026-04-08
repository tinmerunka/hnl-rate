package com.hnlrate.backend.service;

import com.hnlrate.backend.model.Referee;
import com.hnlrate.backend.repository.RefereeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RefereeService {
    private final RefereeRepository refereeRepository;

    public List<Referee> getAll() {
        return refereeRepository.findAll();
    }

    public Optional<Referee> getById(Integer id) {
        return refereeRepository.findById(id);
    }

    public Referee save(Referee referee) {
        return refereeRepository.save(referee);
    }

    public void delete(Integer id) {
        refereeRepository.deleteById(id);
    }
}
