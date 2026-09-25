package com.soccerdev.onboarding;

import com.soccerdev.player.Position;
import com.soccerdev.player.StrongFoot;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class PlayerRegistrationInput {

    @NotNull
    private Long teamId;

    /** If set, links the parent to an existing player already on the team (no new player record created on approval). */
    private Long existingPlayerId;

    // Required when existingPlayerId is null (new child):
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Position primaryPosition;
    private Position secondaryPosition;
    private StrongFoot strongFoot;

    @Min(1) @Max(99)
    private Integer jerseyNumber;
}
