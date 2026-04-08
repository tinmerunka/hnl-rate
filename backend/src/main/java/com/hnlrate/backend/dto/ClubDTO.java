package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.Club;
import lombok.Getter;

@Getter
public class ClubDTO {

    private final Integer id;
    private final String name;
    private final String city;
    private final String logoUrl;

    public ClubDTO(Club club) {
        this.id = club.getId();
        this.name = club.getName();
        this.city = club.getCity();
        this.logoUrl = club.getLogoUrl();
    }
}
