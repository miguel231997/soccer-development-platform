package com.soccerdev.player;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class PlayerResponse {

    private Long id;
    private List<PlayerTeamSummary> teams;
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
