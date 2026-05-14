package com.soccerdev.stats;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
public class PlayerMatchStatsResponse {

    private Long id;
    private Long matchId;
    private Long teamId;
    private String teamName;
    private String opponent;
    private Instant matchDateTime;
    private Long playerId;
    private String playerName;
    private Integer minutesPlayed;
    private int goals;
    private int assists;
    private int shots;
    private int shotsOnTarget;
    private int saves;
    private boolean cleanSheet;
    private BigDecimal xg;
    private BigDecimal xa;
    private BigDecimal xt;
    private BigDecimal dangerPrevented;

    private int successfulPasses;
    private int accurateLongBalls;
    private int chancesCreated;
    private int successfulCrosses;
    private int successfulDribbles;
    private int duelsWon;
    private int dispossessed;
    private int foulsWon;
    private int tackles;
    private int interceptions;
    private int foulsCommitted;
    private int blockedShots;
    private int clearances;
    private int goalsConceded;
    private int yellowCards;
    private int redCards;

    private Instant createdAt;
    private Instant updatedAt;
}
