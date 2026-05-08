package com.soccerdev.stats;

import com.soccerdev.common.BaseIdEntity;
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
public class PlayerMatchStats extends BaseIdEntity {

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
}
