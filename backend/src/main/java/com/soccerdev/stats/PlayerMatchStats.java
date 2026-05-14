package com.soccerdev.stats;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.match.Match;
import com.soccerdev.player.Player;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "player_match_stats", indexes = {
        @Index(name = "idx_pms_match_id", columnList = "match_id"),
        @Index(name = "idx_pms_player_id", columnList = "player_id")
},
        uniqueConstraints = @UniqueConstraint(
                name = "uq_pms_match_player",
                columnNames = {"match_id", "player_id"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerMatchStats extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(name = "minutes_played")
    private Integer minutesPlayed;

    @Column(nullable = false)
    @Builder.Default
    private int goals = 0;

    @Column(nullable = false)
    @Builder.Default
    private int assists = 0;

    @Column(nullable = false)
    @Builder.Default
    private int shots = 0;

    @Column(name = "shots_on_target", nullable = false)
    @Builder.Default
    private int shotsOnTarget = 0;

    @Column(nullable = false)
    @Builder.Default
    private int saves = 0;

    @Column(name = "clean_sheet", nullable = false)
    @Builder.Default
    private boolean cleanSheet = false;

    @Column(precision = 5, scale = 2)
    private BigDecimal xg;

    @Column(precision = 5, scale = 2)
    private BigDecimal xa;

    @Column(precision = 5, scale = 2)
    private BigDecimal xt;

    @Column(name = "danger_prevented", precision = 5, scale = 2)
    private BigDecimal dangerPrevented;

    @Column(name = "successful_passes", nullable = false)
    @Builder.Default
    private int successfulPasses = 0;

    @Column(name = "accurate_long_balls", nullable = false)
    @Builder.Default
    private int accurateLongBalls = 0;

    @Column(name = "chances_created", nullable = false)
    @Builder.Default
    private int chancesCreated = 0;

    @Column(name = "successful_crosses", nullable = false)
    @Builder.Default
    private int successfulCrosses = 0;

    @Column(name = "successful_dribbles", nullable = false)
    @Builder.Default
    private int successfulDribbles = 0;

    @Column(name = "duels_won", nullable = false)
    @Builder.Default
    private int duelsWon = 0;

    @Column(nullable = false)
    @Builder.Default
    private int dispossessed = 0;

    @Column(name = "fouls_won", nullable = false)
    @Builder.Default
    private int foulsWon = 0;

    @Column(nullable = false)
    @Builder.Default
    private int tackles = 0;

    @Column(nullable = false)
    @Builder.Default
    private int interceptions = 0;

    @Column(name = "fouls_committed", nullable = false)
    @Builder.Default
    private int foulsCommitted = 0;

    @Column(name = "blocked_shots", nullable = false)
    @Builder.Default
    private int blockedShots = 0;

    @Column(nullable = false)
    @Builder.Default
    private int clearances = 0;

    @Column(name = "goals_conceded", nullable = false)
    @Builder.Default
    private int goalsConceded = 0;

    @Column(name = "yellow_cards", nullable = false)
    @Builder.Default
    private int yellowCards = 0;

    @Column(name = "red_cards", nullable = false)
    @Builder.Default
    private int redCards = 0;
}
