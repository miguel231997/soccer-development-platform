package com.soccerdev.player;

import com.soccerdev.common.BaseEntity;
import com.soccerdev.team.PlayerTeamAssignment;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "players", indexes = {
        @Index(name = "idx_players_active", columnList = "active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player extends BaseEntity {

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

    @Column(name = "public_profile_enabled", nullable = false)
    @Builder.Default
    private boolean publicProfileEnabled = false;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "player", fetch = FetchType.LAZY)
    @Builder.Default
    private List<PlayerTeamAssignment> teamAssignments = new ArrayList<>();
}
