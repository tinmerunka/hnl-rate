package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.User;
import lombok.Getter;

@Getter
public class UserProfileDTO {

    private final Integer id;
    private final String username;
    private final String email;
    private final String role;
    private final ClubDTO favoriteClub;

    public UserProfileDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.favoriteClub = user.getFavoriteClub() != null ? new ClubDTO(user.getFavoriteClub()) : null;
    }
}
