package com.hnlrate.backend.dto;

import com.hnlrate.backend.model.VoteType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteRequestDTO {
    private VoteType voteType;
}
