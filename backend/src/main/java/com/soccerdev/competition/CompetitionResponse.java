package com.soccerdev.competition;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CompetitionResponse {

    private Long id;
    private String name;
    private CompetitionType type;
    private String region;
    private String level;
    private String location;
    private String compSeason;
    private boolean preset;
    private String states;
}
