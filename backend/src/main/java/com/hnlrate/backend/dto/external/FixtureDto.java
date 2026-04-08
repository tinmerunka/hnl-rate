package com.hnlrate.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class FixtureDto {
    private Integer id;
    private String date;
    private String referee;
    private FixtureStatusDto status;
}
