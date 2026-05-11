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

    private Instant createdAt;
    private Instant updatedAt;
}
