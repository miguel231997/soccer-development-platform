package com.soccerdev.onboarding;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class TeamInviteCodeResponse {
    private Long id;
    private String code;
    private Long teamId;
    private String teamName;
    private boolean active;
    private Integer maxUses;
    private int usesCount;
    private Instant expiresAt;
    private Instant createdAt;
}
