package com.soccerdev.competition;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompetitionResponse {

    private Long id;
    private String name;
    private CompetitionType type;
}
