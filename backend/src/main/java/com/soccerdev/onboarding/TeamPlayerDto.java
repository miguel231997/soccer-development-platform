package com.soccerdev.onboarding;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TeamPlayerDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String primaryPosition;
    private Integer jerseyNumber;
    private String profileImageUrl;
}
