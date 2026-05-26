package com.hnlrate.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlayerRequest {
    private String firstName;
    private String lastName;
    private String position;
    private Integer number;
    private Integer clubId;
}
