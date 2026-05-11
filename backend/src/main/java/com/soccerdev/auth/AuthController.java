package com.soccerdev.auth;

import com.soccerdev.common.ApiResponse;
import com.soccerdev.security.CurrentUserService;
import com.soccerdev.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CurrentUserService currentUserService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @RequestBody @Valid RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody @Valid LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CurrentUserResponse>> me(
            @AuthenticationPrincipal UserDetails userDetails) {
        CurrentUserResponse response = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/join-team")
    public ResponseEntity<ApiResponse<JoinTeamResponse>> joinTeam(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid JoinTeamRequest request) {
        User user = currentUserService.getUser(userDetails);
        JoinTeamResponse response = authService.joinTeam(user, request.getRegistrationCode());
        return ResponseEntity.ok(ApiResponse.ok("Joined team successfully", response));
    }
}
