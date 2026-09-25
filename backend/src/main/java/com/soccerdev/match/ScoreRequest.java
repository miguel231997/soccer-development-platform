package com.soccerdev.match;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScoreRequest {

    @NotNull @Min(0)
    private Integer homeScore;

    @NotNull @Min(0)
    private Integer awayScore;
}
