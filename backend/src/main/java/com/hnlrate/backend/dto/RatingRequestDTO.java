package com.hnlrate.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingRequestDTO {
    private Integer rating;
    private String comment;
}
