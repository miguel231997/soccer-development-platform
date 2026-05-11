package com.soccerdev.onboarding;

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

import java.util.List;

@RestController
@RequestMapping("/api/player-registration-requests")
@RequiredArgsConstructor
public class PlayerRegistrationController {

    private final PlayerRegistrationService playerRegistrationService;
    private final CurrentUserService currentUserService;

    /** PARENT: submit a player registration request for a team they belong to. */
    @PostMapping
    public ResponseEntity<ApiResponse<PlayerRegistrationResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid PlayerRegistrationInput input) {
        User parent = currentUserService.getUser(userDetails);
        PlayerRegistrationResponse response = playerRegistrationService.create(parent, input);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Player registration request submitted", response));
    }

    /** PARENT: view own requests. */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PlayerRegistrationResponse>>> listMine(
            @AuthenticationPrincipal UserDetails userDetails) {
        User parent = currentUserService.getUser(userDetails);
        List<PlayerRegistrationResponse> response = playerRegistrationService.listMine(parent);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /** ADMIN / DIRECTOR / COACH: list requests for teams they manage. */
    @GetMapping("/manage")
    public ResponseEntity<ApiResponse<List<PlayerRegistrationResponse>>> listManage(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = currentUserService.getUser(userDetails);
        List<PlayerRegistrationResponse> response = playerRegistrationService.listManage(user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /** ADMIN / DIRECTOR / COACH: approve a request (creates Player + PlayerTeamAssignment + ParentPlayerRelationship). */
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PlayerRegistrationResponse>> approve(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        PlayerRegistrationResponse response = playerRegistrationService.approve(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Player registration request approved", response));
    }

    /** ADMIN / DIRECTOR / COACH: reject a request. */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PlayerRegistrationResponse>> reject(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody(required = false) PlayerRegistrationRejectInput input) {
        User user = currentUserService.getUser(userDetails);
        PlayerRegistrationResponse response = playerRegistrationService.reject(
                user, id, input != null ? input : new PlayerRegistrationRejectInput());
        return ResponseEntity.ok(ApiResponse.ok("Player registration request rejected", response));
    }
}
