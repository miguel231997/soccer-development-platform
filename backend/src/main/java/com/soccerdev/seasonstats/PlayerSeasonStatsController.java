package com.soccerdev.seasonstats;

import com.soccerdev.common.ApiResponse;
import com.soccerdev.security.CurrentUserService;
import com.soccerdev.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PlayerSeasonStatsController {

    private final PlayerSeasonStatsService service;
    private final CurrentUserService currentUserService;

    @GetMapping("/api/players/{playerId}/season-stats")
    public ResponseEntity<ApiResponse<PlayerSeasonStatsResponse>> getForPlayer(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long playerId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(service.getForPlayer(user, playerId)));
    }

    @GetMapping("/api/public/players/{playerId}/season-stats")
    public ResponseEntity<ApiResponse<PlayerSeasonStatsResponse>> getPublic(
            @PathVariable Long playerId) {
        return ResponseEntity.ok(ApiResponse.ok(service.getPublicForPlayer(playerId)));
    }
}
