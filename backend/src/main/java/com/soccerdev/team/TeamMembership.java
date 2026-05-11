package com.soccerdev.team;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "team_memberships", indexes = {
        @Index(name = "idx_tm_user_id", columnList = "user_id"),
        @Index(name = "idx_tm_team_id", columnList = "team_id")
},
        uniqueConstraints = @UniqueConstraint(
                name = "uq_tm_user_team",
                columnNames = {"user_id", "team_id"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMembership extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

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
}
