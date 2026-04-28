package com.hnlrate.backend.service;

import com.hnlrate.backend.model.Club;
import com.hnlrate.backend.model.User;
import com.hnlrate.backend.repository.ClubRepository;
import com.hnlrate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> getById(Integer id) {
        return userRepository.findById(id);
    }

    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public void updatePasswordHash(Integer userId, String passwordHash) {
        userRepository.updatePasswordHash(userId, passwordHash);
    }

    public void delete(Integer id) {
        userRepository.deleteById(id);
    }

    public User setFavoriteClub(String username, Integer clubId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Klub nije pronađen"));
        user.setFavoriteClub(club);
        return userRepository.save(user);
    }

    public User removeFavoriteClub(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Korisnik nije pronađen"));
        user.setFavoriteClub(null);
        return userRepository.save(user);
    }
}
