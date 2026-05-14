package com.soccerdev.stats;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class PlayerMatchStatsRequest {

    @Min(0)
    private Integer minutesPlayed;

    @Min(0)
    private Integer goals;

    @Min(0)
    private Integer assists;

    @Min(0)
    private Integer shots;

    @Min(0)
    private Integer shotsOnTarget;

    @Min(0)
    private Integer saves;

    private Boolean cleanSheet;

    @DecimalMin("0.00")
    private BigDecimal xg;

    @DecimalMin("0.00")
    private BigDecimal xa;

    @DecimalMin("0.00")
    private BigDecimal xt;

    @DecimalMin("0.00")
    private BigDecimal dangerPrevented;

    @Min(0) private Integer successfulPasses;
    @Min(0) private Integer accurateLongBalls;
    @Min(0) private Integer chancesCreated;
    @Min(0) private Integer successfulCrosses;
    @Min(0) private Integer successfulDribbles;
    @Min(0) private Integer duelsWon;
    @Min(0) private Integer dispossessed;
    @Min(0) private Integer foulsWon;
    @Min(0) private Integer tackles;
    @Min(0) private Integer interceptions;
    @Min(0) private Integer foulsCommitted;
    @Min(0) private Integer blockedShots;
    @Min(0) private Integer clearances;
    @Min(0) private Integer goalsConceded;
    @Min(0) private Integer yellowCards;
    @Min(0) private Integer redCards;
}
