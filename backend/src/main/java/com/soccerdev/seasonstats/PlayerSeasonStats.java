package com.soccerdev.seasonstats;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.player.Player;
import com.soccerdev.season.Season;
import com.soccerdev.team.Team;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_season_stats",
    uniqueConstraints = @UniqueConstraint(name = "uq_pss_player_team_season",
        columnNames = {"player_id", "team_id", "season_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlayerSeasonStats extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id")
    private Season season;

    // Shooting
    @Builder.Default private int goals = 0;
    @Builder.Default private int shots = 0;
    @Column(name = "shots_on_target") @Builder.Default private int shotsOnTarget = 0;

    // Passing
    @Builder.Default private int assists = 0;
    @Column(name = "successful_passes") @Builder.Default private int successfulPasses = 0;
    @Column(name = "accurate_long_balls") @Builder.Default private int accurateLongBalls = 0;
    @Column(name = "chances_created") @Builder.Default private int chancesCreated = 0;
    @Column(name = "successful_crosses") @Builder.Default private int successfulCrosses = 0;

    // Possession
    @Column(name = "successful_dribbles") @Builder.Default private int successfulDribbles = 0;
    @Column(name = "duels_won") @Builder.Default private int duelsWon = 0;
    @Builder.Default private int dispossessed = 0;
    @Column(name = "fouls_won") @Builder.Default private int foulsWon = 0;

    // Defending
    @Builder.Default private int tackles = 0;
    @Builder.Default private int interceptions = 0;
    @Column(name = "fouls_committed") @Builder.Default private int foulsCommitted = 0;
    @Column(name = "blocked_shots") @Builder.Default private int blockedShots = 0;
    @Builder.Default private int clearances = 0;
    @Column(name = "goals_conceded") @Builder.Default private int goalsConceded = 0;

    // Discipline
    @Column(name = "yellow_cards") @Builder.Default private int yellowCards = 0;
    @Column(name = "red_cards") @Builder.Default private int redCards = 0;
}
