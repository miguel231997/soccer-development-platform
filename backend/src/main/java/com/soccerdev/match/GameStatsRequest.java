package com.soccerdev.match;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GameStatsRequest {

    @Min(0) @Max(100)
    private Integer possessionPct;

    @Min(0)
    private Integer teamShots;

    @Min(0)
    private Integer opponentShots;

    @Min(0)
    private Integer teamCompletedPasses;

    @Min(0)
    private Integer opponentCompletedPasses;

    @Min(0)
    private Integer teamTouches;

    @Min(0) @Max(100)
    private Integer teamPassCompletionPct;
}
