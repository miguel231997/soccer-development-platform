package com.soccerdev.onboarding;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.team.Team;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "registration_codes", indexes = {
        @Index(name = "idx_rc_code",    columnList = "code"),
        @Index(name = "idx_rc_team_id", columnList = "team_id"),
        @Index(name = "idx_rc_active",  columnList = "active")
},
        uniqueConstraints = @UniqueConstraint(
                name = "uq_registration_codes_code",
                columnNames = {"code"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationCode extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 64)
    private String code;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private UserRole role;

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
