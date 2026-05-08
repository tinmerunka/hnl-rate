package com.hnlrate.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class FixtureStatusDto {

    private String shortStatus;

    public String getShortStatus() {
        return shortStatus;
    }

    // Jackson maps JSON key "short" → setShort() via standard JavaBean convention.
    // This avoids relying on @JsonProperty("short") which may not be processed
    // correctly in Spring Boot 4 (Jackson 3.x uses tools.jackson.* package).
    public void setShort(String value) {
        this.shortStatus = value;
    }
}
