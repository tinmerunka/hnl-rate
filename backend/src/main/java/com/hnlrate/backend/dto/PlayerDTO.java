package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.Player;
import lombok.Getter;

@Getter
public class PlayerDTO {
    private final Integer id;
    private final String firstName;
    private final String lastName;
    private final String position;
    private final Integer number;
    private final ClubDTO club;

    public PlayerDTO(Player player) {
        this.id = player.getId();
        this.firstName = player.getFirstName();
        this.lastName = player.getLastName();
        this.position = player.getPosition();
        this.number = player.getNumber();
        this.club = new ClubDTO(player.getClub());
    }
}
