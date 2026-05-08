package com.soccerdev.auth;

import com.soccerdev.user.UserRole;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthResponse {

    private String token;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
}
