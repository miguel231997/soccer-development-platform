package com.soccerdev.evaluation;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.match.Match;
import com.soccerdev.player.Player;
import com.soccerdev.player.Position;
import com.soccerdev.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "player_match_evaluations", indexes = {
        @Index(name = "idx_pme_match_id", columnList = "match_id"),
        @Index(name = "idx_pme_player_id", columnList = "player_id"),
        @Index(name = "idx_pme_coach_user_id", columnList = "coach_user_id")
},
        uniqueConstraints = @UniqueConstraint(
                name = "uq_pme_match_player_coach",
                columnNames = {"match_id", "player_id", "coach_user_id"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerMatchEvaluation extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_user_id", nullable = false)
    private User coachUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "position_played", length = 10)
    private Position positionPlayed;

    @Min(1) @Max(10)
    @Column(name = "technical_rating")
    private Integer technicalRating;

    @Min(1) @Max(10)
    @Column(name = "tactical_rating")
    private Integer tacticalRating;

    @Min(1) @Max(10)
    @Column(name = "physical_rating")
    private Integer physicalRating;

    @Min(1) @Max(10)
    @Column(name = "mentality_rating")
    private Integer mentalityRating;

    @Min(1) @Max(10)
    @Column(name = "attacking_rating")
    private Integer attackingRating;

    @Min(1) @Max(10)
    @Column(name = "defending_rating")
    private Integer defendingRating;

    @Min(1) @Max(10)
    @Column(name = "decision_making_rating")
    private Integer decisionMakingRating;

    @Min(1) @Max(10)
    @Column(name = "work_rate_rating")
    private Integer workRateRating;

    @Min(1) @Max(10)
    @Column(name = "overall_rating")
    private Integer overallRating;

    @Column(name = "parent_visible_notes", columnDefinition = "TEXT")
    private String parentVisibleNotes;

    @Column(name = "coach_only_notes", columnDefinition = "TEXT")
    private String coachOnlyNotes;
}
