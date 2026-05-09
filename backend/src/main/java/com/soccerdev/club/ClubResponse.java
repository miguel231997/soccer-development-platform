package com.soccerdev.club;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ClubResponse {

    private Long id;
    private String name;
    private String city;
    private String state;
    private Instant createdAt;
    private Instant updatedAt;
}
