package com.soccerdev.player;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class PlayerTeamSummary {
    private Long teamId;
    private String teamName;
    private Long seasonId;
    private String seasonName;
    private boolean active;
    private Instant joinedAt;
    private Instant leftAt;
}
