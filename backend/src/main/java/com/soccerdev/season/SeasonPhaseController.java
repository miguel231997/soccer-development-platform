package com.soccerdev.season;

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
public class SeasonPhaseController {

    private final SeasonPhaseService seasonPhaseService;
    private final CurrentUserService currentUserService;

    @GetMapping("/api/seasons/{seasonId}/phases")
    public ResponseEntity<ApiResponse<List<SeasonPhaseResponse>>> listBySeason(
            @PathVariable Long seasonId) {
        return ResponseEntity.ok(ApiResponse.ok(seasonPhaseService.listBySeason(seasonId)));
    }

    @PostMapping("/api/seasons/{seasonId}/phases")
    public ResponseEntity<ApiResponse<SeasonPhaseResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long seasonId,
            @Valid @RequestBody SeasonPhaseRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(seasonPhaseService.create(user, seasonId, request)));
    }

    @PutMapping("/api/season-phases/{id}")
    public ResponseEntity<ApiResponse<SeasonPhaseResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SeasonPhaseRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(seasonPhaseService.update(user, id, request)));
    }
}
