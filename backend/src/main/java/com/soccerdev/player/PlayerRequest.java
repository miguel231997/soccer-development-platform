package com.soccerdev.player;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PlayerRequest {

    private Long teamId;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotNull
    private LocalDate dateOfBirth;

    @NotNull
    private Position primaryPosition;

    private Position secondaryPosition;

    private StrongFoot strongFoot;

    @Min(1) @Max(99)
    private Integer jerseyNumber;

    private boolean publicProfileEnabled;

    private String profileImageUrl;
}
