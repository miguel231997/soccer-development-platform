package com.soccerdev.match;

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
public class MatchController {

    private final MatchService matchService;
    private final CurrentUserService currentUserService;

    @GetMapping("/api/matches")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(matchService.list(user)));
    }

    @GetMapping("/api/matches/{id}")
    public ResponseEntity<ApiResponse<MatchResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(matchService.getById(user, id)));
    }

    @GetMapping("/api/teams/{teamId}/matches")
    public ResponseEntity<ApiResponse<List<MatchResponse>>> listByTeam(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long teamId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(matchService.listByTeam(user, teamId)));
    }

    @PostMapping("/api/matches")
    public ResponseEntity<ApiResponse<MatchResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody MatchRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(matchService.create(user, request)));
    }

    @PutMapping("/api/matches/{id}")
    public ResponseEntity<ApiResponse<MatchResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody MatchRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(matchService.update(user, id, request)));
    }

    @DeleteMapping("/api/matches/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        matchService.delete(user, id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Match deleted").build());
    }

    @PatchMapping("/api/matches/{id}/analysis")
    public ResponseEntity<ApiResponse<MatchResponse>> updateAnalysis(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody AnalysisRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(matchService.updateAnalysis(user, id, request.getAnalysis())));
    }

    @PatchMapping("/api/matches/{id}/game-stats")
    public ResponseEntity<ApiResponse<MatchResponse>> updateGameStats(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody GameStatsRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(matchService.updateGameStats(user, id, request)));
    }

    @PostMapping("/api/matches/{id}/finalize")
    public ResponseEntity<ApiResponse<MatchResponse>> finalize(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(matchService.finalize(user, id)));
    }
}
