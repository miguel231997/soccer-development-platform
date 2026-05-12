package com.soccerdev.competition;

import com.soccerdev.common.BaseIdEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "competitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Competition extends BaseIdEntity {

    @NotBlank
    @Column(nullable = false, length = 255)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CompetitionType type;

    @Column(length = 100)
    private String region;

    @Column(length = 50)
    private String level;

    @Column(length = 200)
    private String location;

    @Column(name = "comp_season", length = 20)
    private String compSeason;

    @Column(name = "is_preset", nullable = false)
    private boolean preset;

    /** Comma-separated 2-letter state codes; null means national/all states. */
    @Column(length = 100)
    private String states;
}
