package com.hnlrate.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class StatisticsResponseItem {
    private TeamDto team;
    private List<StatEntry> statistics;

    @Getter
    @Setter
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StatEntry {
        private String type;
        private Object value; // Integer, Long, String ("45%"), or null
    }
}
