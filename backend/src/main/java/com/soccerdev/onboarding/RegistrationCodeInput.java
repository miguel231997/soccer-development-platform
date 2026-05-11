package com.soccerdev.onboarding;

import com.soccerdev.user.UserRole;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class RegistrationCodeInput {

    @NotNull
    private Long teamId;

    @NotNull
    private UserRole role;

    private Instant expiresAt;

    @Min(1)
    private Integer maxUses;
}
