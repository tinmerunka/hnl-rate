package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.Referee;
import lombok.Getter;

@Getter
public class RefereeDTO {
    private final Integer id;
    private final String firstName;
    private final String lastName;

    public RefereeDTO(Referee referee) {
        this.id = referee.getId();
        this.firstName = referee.getFirstName();
        this.lastName = referee.getLastName();
    }
}
