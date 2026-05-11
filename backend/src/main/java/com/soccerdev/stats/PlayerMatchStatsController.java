package com.soccerdev.stats;

import com.soccerdev.common.ApiResponse;
import com.soccerdev.security.CurrentUserService;
import com.soccerdev.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PlayerMatchStatsController {

    private final PlayerMatchStatsService statsService;
    private final CurrentUserService currentUserService;

    @GetMapping("/api/matches/{matchId}/stats")
    public ResponseEntity<ApiResponse<List<PlayerMatchStatsResponse>>> getByMatch(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long matchId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(statsService.getByMatch(user, matchId)));
    }

    @GetMapping("/api/players/{playerId}/stats")
    public ResponseEntity<ApiResponse<List<PlayerMatchStatsResponse>>> getByPlayer(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long playerId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(statsService.getByPlayer(user, playerId)));
    }

    @PutMapping("/api/matches/{matchId}/players/{playerId}/stats")
    public ResponseEntity<ApiResponse<PlayerMatchStatsResponse>> upsert(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long matchId,
            @PathVariable Long playerId,
            @Valid @RequestBody PlayerMatchStatsRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(statsService.upsert(user, matchId, playerId, request)));
    }
}
