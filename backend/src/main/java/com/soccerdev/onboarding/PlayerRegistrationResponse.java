package com.soccerdev.onboarding;

import com.soccerdev.player.Position;
import com.soccerdev.player.StrongFoot;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Builder
public class PlayerRegistrationResponse {

    private Long id;
    private Long parentUserId;
    private String parentUserName;
    private Long teamId;
    private String teamName;
    private Long existingPlayerId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Position primaryPosition;
    private Position secondaryPosition;
    private StrongFoot strongFoot;
    private Integer jerseyNumber;
    private RegistrationStatus status;
    private Long reviewedByUserId;
    private String reviewedByUserName;
    private Instant reviewedAt;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;
}
