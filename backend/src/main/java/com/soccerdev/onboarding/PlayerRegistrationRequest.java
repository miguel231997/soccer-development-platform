package com.soccerdev.onboarding;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.player.Position;
import com.soccerdev.player.StrongFoot;
import com.soccerdev.team.Team;
import com.soccerdev.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "player_registration_requests", indexes = {
        @Index(name = "idx_prr_parent_user_id", columnList = "parent_user_id"),
        @Index(name = "idx_prr_team_id", columnList = "team_id"),
        @Index(name = "idx_prr_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerRegistrationRequest extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_user_id", nullable = false)
    private User parentUser;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @NotBlank
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotNull
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "primary_position", nullable = false, length = 10)
    private Position primaryPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "secondary_position", length = 10)
    private Position secondaryPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "strong_foot", length = 10)
    private StrongFoot strongFoot;

    @Min(1) @Max(99)
    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedByUser;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;
}
