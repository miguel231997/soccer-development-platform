package com.soccerdev.onboarding;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeamInviteCodeInput {

    @NotNull
    private Long teamId;

    private Integer maxUses;
}
