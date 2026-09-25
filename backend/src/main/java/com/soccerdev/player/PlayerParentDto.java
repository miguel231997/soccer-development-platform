package com.soccerdev.player;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class PlayerParentDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String relationshipType;
}
