package com.hnlrate.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class LineupResponseItem {
    private TeamDto team;
    private String formation;
    private List<LineupPlayerEntryDto> startXI;
    private List<LineupPlayerEntryDto> substitutes;
}
