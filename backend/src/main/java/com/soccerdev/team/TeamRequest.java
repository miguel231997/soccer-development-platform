package com.soccerdev.team;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamRequest {

    @NotNull
    private Long clubId;

    @NotBlank
    private String name;

    @NotNull
    private AgeGroup ageGroup;

    @NotNull
    private Gender gender;

    @NotNull
    private CompetitiveLevel competitiveLevel;
}
