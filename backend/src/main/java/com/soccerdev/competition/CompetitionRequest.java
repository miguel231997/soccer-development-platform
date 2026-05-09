package com.soccerdev.competition;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompetitionRequest {

    @NotBlank
    private String name;

    @NotNull
    private CompetitionType type;
}
