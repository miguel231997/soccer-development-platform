package com.soccerdev.leaderboard;

import com.soccerdev.player.Position;
import com.soccerdev.player.StrongFoot;
import com.soccerdev.team.AgeGroup;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class PublicPlayerProfile {

    private Long id;
    private String firstName;
    private String lastName;
    private Position primaryPosition;
    private Position secondaryPosition;
    private StrongFoot strongFoot;
    private Integer jerseyNumber;
    private String profileImageUrl;
    private Long teamId;
    private String teamName;
    private AgeGroup ageGroup;
    private Long clubId;
    private String clubName;

    // Aggregated career stats
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
