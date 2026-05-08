package com.soccerdev.auth;

import com.soccerdev.user.UserRole;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class CurrentUserResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private boolean enabled;
    private Instant createdAt;
}
