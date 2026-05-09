package com.soccerdev.player;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Builder
public class PlayerResponse {

    private Long id;
    private Long teamId;
    private String teamName;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private Position primaryPosition;
    private Position secondaryPosition;
    private StrongFoot strongFoot;
    private Integer jerseyNumber;
    private boolean publicProfileEnabled;
    private String profileImageUrl;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
