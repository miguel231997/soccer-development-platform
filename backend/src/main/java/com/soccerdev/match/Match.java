package com.soccerdev.match;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.competition.Competition;
import com.soccerdev.season.Season;
import com.soccerdev.season.SeasonPhase;
import com.soccerdev.team.Team;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "matches", indexes = {
        @Index(name = "idx_matches_team_id", columnList = "team_id"),
        @Index(name = "idx_matches_season_id", columnList = "season_id"),
        @Index(name = "idx_matches_match_date_time", columnList = "match_date_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_phase_id")
    private SeasonPhase seasonPhase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id")
    private Competition competition;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String opponent;

    @NotNull
    @Column(name = "match_date_time", nullable = false)
    private Instant matchDateTime;

    @Column(length = 255)
    private String location;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "home_away", nullable = false, length = 10)
    private HomeAway homeAway;

    @Column(name = "home_score")
    private Integer homeScore;

    @Column(name = "away_score")
    private Integer awayScore;

    @Column(nullable = false)
    @Builder.Default
    private boolean finalized = false;

    @Column(columnDefinition = "TEXT")
    private String analysis;

    // Team-level game stats (locked once saved)
    @Column(name = "game_stats_locked", nullable = false)
    @Builder.Default
    private boolean gameStatsLocked = false;

    @Column(name = "possession_pct")
    private Integer possessionPct;

    @Column(name = "team_shots")
    private Integer teamShots;

    @Column(name = "opponent_shots")
    private Integer opponentShots;

    @Column(name = "team_completed_passes")
    private Integer teamCompletedPasses;

    @Column(name = "opponent_completed_passes")
    private Integer opponentCompletedPasses;

    @Column(name = "team_touches")
    private Integer teamTouches;

    @Column(name = "team_pass_completion_pct")
    private Integer teamPassCompletionPct;
}
