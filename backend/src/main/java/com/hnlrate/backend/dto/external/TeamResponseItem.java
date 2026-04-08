package com.hnlrate.backend.dto.external;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class TeamResponseItem {
    private TeamDto team;
    private VenueDto venue;
}
