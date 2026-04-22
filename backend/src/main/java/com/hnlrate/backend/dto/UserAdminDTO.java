package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.User;
import lombok.Getter;

@Getter
public class UserAdminDTO {

    private final Integer id;
    private final String username;
    private final String email;
    private final String role;
    private final Boolean blocked;
    private final ClubDTO favoriteClub;

    public UserAdminDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.blocked = user.getBlocked();
        this.favoriteClub = user.getFavoriteClub() != null ? new ClubDTO(user.getFavoriteClub()) : null;
    }
}
