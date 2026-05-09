package com.soccerdev.team;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class TeamResponse {

    private Long id;
    private Long clubId;
    private String clubName;
    private String name;
    private AgeGroup ageGroup;
    private Gender gender;
    private CompetitiveLevel competitiveLevel;
    private Instant createdAt;
    private Instant updatedAt;
}
