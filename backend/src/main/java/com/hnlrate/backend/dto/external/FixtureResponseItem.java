package com.hnlrate.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class FixtureResponseItem {
    private FixtureDto fixture;
    private FixtureLeagueDto league;
    private FixtureTeamsDto teams;
    private FixtureGoalsDto goals;
}
