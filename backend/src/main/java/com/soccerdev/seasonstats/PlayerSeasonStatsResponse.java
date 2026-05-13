package com.soccerdev.seasonstats;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlayerSeasonStatsResponse {

    private Long playerId;
    private String teamName;
    private String seasonName;

    // Shooting
    private StatEntry goals;
    private StatEntry shots;
    private StatEntry shotsOnTarget;

    // Passing
    private StatEntry assists;
    private StatEntry successfulPasses;
    private StatEntry accurateLongBalls;
    private StatEntry chancesCreated;
    private StatEntry successfulCrosses;

    // Possession
    private StatEntry successfulDribbles;
    private StatEntry duelsWon;
    private StatEntry dispossessed;
    private StatEntry foulsWon;

    // Defending
    private StatEntry tackles;
    private StatEntry interceptions;
    private StatEntry foulsCommitted;
    private StatEntry blockedShots;
    private StatEntry clearances;
    private StatEntry goalsConceded;

    // Discipline
    private StatEntry yellowCards;
    private StatEntry redCards;
}
