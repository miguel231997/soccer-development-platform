package com.soccerdev.evaluation;

import com.soccerdev.player.Position;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EvaluationRequest {

    private Position positionPlayed;

    @Min(1) @Max(10)
    private Integer technicalRating;

    @Min(1) @Max(10)
    private Integer tacticalRating;

    @Min(1) @Max(10)
    private Integer physicalRating;

    @Min(1) @Max(10)
    private Integer mentalityRating;

    @Min(1) @Max(10)
    private Integer attackingRating;

    @Min(1) @Max(10)
    private Integer defendingRating;

    @Min(1) @Max(10)
    private Integer decisionMakingRating;

    @Min(1) @Max(10)
    private Integer workRateRating;

    @Min(1) @Max(10)
    private Integer overallRating;

    private String parentVisibleNotes;

    private String coachOnlyNotes;
}
