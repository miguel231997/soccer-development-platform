package com.soccerdev.leaderboard;

import com.soccerdev.player.Position;
import com.soccerdev.team.AgeGroup;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PlayerLeaderboardEntry {

    private Long playerId;
    private String playerName;
    private String profileImageUrl;
    private Position position;
    private Long teamId;
    private String teamName;
    private AgeGroup ageGroup;
    private Long clubId;
    private String clubName;
    private int appearances;
    private long minutesPlayed;
    private long goals;
    private long assists;
    private long shots;
    private long shotsOnTarget;
    private long saves;
    private int cleanSheets;
    private BigDecimal xg;
    private BigDecimal xa;
    private BigDecimal xt;
    private BigDecimal dangerPrevented;
}
