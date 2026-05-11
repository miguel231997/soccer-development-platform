package com.soccerdev.team;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.player.Player;
import com.soccerdev.season.Season;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "player_team_assignments", indexes = {
        @Index(name = "idx_pta_player_id", columnList = "player_id"),
        @Index(name = "idx_pta_team_id",   columnList = "team_id"),
        @Index(name = "idx_pta_active",    columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerTeamAssignment extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id")
    private Season season;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private Instant joinedAt = Instant.now();

    @Column(name = "left_at")
    private Instant leftAt;
}
