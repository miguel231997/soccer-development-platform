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
@RequiredArgsConstructor
public class TeamInviteCodeController {

    private final TeamInviteCodeService teamInviteCodeService;
    private final CurrentUserService currentUserService;

    @PostMapping("/api/admin/team-invite-codes")
    public ResponseEntity<ApiResponse<TeamInviteCodeResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid TeamInviteCodeInput input) {
        User admin = currentUserService.getUser(userDetails);
        TeamInviteCodeResponse response = teamInviteCodeService.create(admin, input);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Team invite code created", response));
    }

    @GetMapping("/api/admin/team-invite-codes")
    public ResponseEntity<ApiResponse<List<TeamInviteCodeResponse>>> listAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(teamInviteCodeService.listAll(admin)));
    }

    @PutMapping("/api/admin/team-invite-codes/{id}/disable")
    public ResponseEntity<ApiResponse<TeamInviteCodeResponse>> disable(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User admin = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(teamInviteCodeService.disable(admin, id)));
    }

    /** Parent-accessible: resolve a code to a team name (preview before submitting registration). */
    @GetMapping("/api/team-invite-codes/lookup/{code}")
    public ResponseEntity<ApiResponse<TeamInviteCodeResponse>> lookup(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(teamInviteCodeService.lookup(code)));
    }

    /** Parent-accessible: list active players on the team for the given invite code. */
    @GetMapping("/api/team-invite-codes/lookup/{code}/players")
    public ResponseEntity<ApiResponse<List<TeamPlayerDto>>> lookupPlayers(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.ok(teamInviteCodeService.lookupPlayers(code)));
    }
}
