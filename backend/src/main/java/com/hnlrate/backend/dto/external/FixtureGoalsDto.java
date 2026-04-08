package com.hnlrate.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class FixtureGoalsDto {
    private Integer home;
    private Integer away;
}
