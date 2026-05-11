package com.soccerdev.auth;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class JoinTeamResponse {
    private Long teamId;
    private String teamName;
}
