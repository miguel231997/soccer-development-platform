package com.soccerdev.team;

import com.soccerdev.common.BaseIdEntity;
import com.soccerdev.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "coach_team_assignments", indexes = {
        @Index(name = "idx_cta_coach_user_id", columnList = "coach_user_id"),
        @Index(name = "idx_cta_team_id", columnList = "team_id")
},
        uniqueConstraints = @UniqueConstraint(
                name = "uq_cta_coach_team",
                columnNames = {"coach_user_id", "team_id"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachTeamAssignment extends BaseIdEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "coach_user_id", nullable = false)
    private User coachUser;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;
}
