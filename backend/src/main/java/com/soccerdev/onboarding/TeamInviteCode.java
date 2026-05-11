package com.soccerdev.onboarding;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.team.Team;
import com.soccerdev.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "team_invite_codes", indexes = {
        @Index(name = "idx_tic_code",    columnList = "code"),
        @Index(name = "idx_tic_team_id", columnList = "team_id"),
        @Index(name = "idx_tic_active",  columnList = "active")
},
        uniqueConstraints = @UniqueConstraint(name = "uq_team_invite_codes_code", columnNames = {"code"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamInviteCode extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 64)
    private String code;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Column(name = "uses_count", nullable = false)
    @Builder.Default
    private int usesCount = 0;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;
}
