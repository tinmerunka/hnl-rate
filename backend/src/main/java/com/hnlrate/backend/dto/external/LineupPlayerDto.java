package com.hnlrate.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class LineupPlayerDto {
    private Integer id;
    private String name;
    private Integer number;
    private String pos;
    private String grid;
}
