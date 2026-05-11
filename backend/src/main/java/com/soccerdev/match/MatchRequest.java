package com.soccerdev.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class MatchRequest {

    @NotNull
    private Long teamId;

    @NotNull
    private Long seasonId;

    private Long seasonPhaseId;

    private Long competitionId;

    @NotBlank
    private String opponent;

    @NotNull
    private Instant matchDateTime;

    private String location;

    @NotNull
    private HomeAway homeAway;

    private Integer homeScore;

    private Integer awayScore;
}
