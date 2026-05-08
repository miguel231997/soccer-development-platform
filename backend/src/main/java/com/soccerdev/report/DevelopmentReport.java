package com.soccerdev.report;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.player.Player;
import com.soccerdev.season.Season;
import com.soccerdev.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "development_reports", indexes = {
        @Index(name = "idx_dr_player_id", columnList = "player_id"),
        @Index(name = "idx_dr_season_id", columnList = "season_id"),
        @Index(name = "idx_dr_generated_by_user_id", columnList = "generated_by_user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DevelopmentReport extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generated_by_user_id", nullable = false)
    private User generatedByUser;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "areas_to_improve", columnDefinition = "TEXT")
    private String areasToImprove;

    @Column(name = "training_focus", columnDefinition = "TEXT")
    private String trainingFocus;

    @Column(name = "parent_summary", columnDefinition = "TEXT")
    private String parentSummary;

    @Column(name = "coach_only_analysis", columnDefinition = "TEXT")
    private String coachOnlyAnalysis;

    @Column(name = "approved_for_parent", nullable = false)
    @Builder.Default
    private boolean approvedForParent = false;
}
