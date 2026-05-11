package com.soccerdev.onboarding;

import com.soccerdev.user.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class RegistrationCodeResponse {

    private Long id;
    private String code;
    private Long teamId;
    private String teamName;
    private UserRole role;
    private boolean active;
    private Instant expiresAt;
    private Integer maxUses;
    private int usesCount;
    private Long createdByUserId;
    private String createdByUserName;
    private Instant createdAt;
    private Instant updatedAt;
}
