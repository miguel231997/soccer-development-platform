package com.soccerdev.evaluation;

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
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final CurrentUserService currentUserService;

    @PostMapping("/api/matches/{matchId}/players/{playerId}/evaluation")
    public ResponseEntity<ApiResponse<CoachEvaluationDto>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long matchId,
            @PathVariable Long playerId,
            @Valid @RequestBody EvaluationRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(evaluationService.create(user, matchId, playerId, request)));
    }

    @GetMapping("/api/matches/{matchId}/evaluations")
    public ResponseEntity<ApiResponse<List<EvaluationView>>> getByMatch(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long matchId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(evaluationService.getByMatch(user, matchId)));
    }

    @GetMapping("/api/players/{playerId}/evaluations")
    public ResponseEntity<ApiResponse<List<EvaluationView>>> getByPlayer(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long playerId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(evaluationService.getByPlayer(user, playerId)));
    }

    @GetMapping("/api/evaluations/{evaluationId}")
    public ResponseEntity<ApiResponse<EvaluationView>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long evaluationId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(evaluationService.getById(user, evaluationId)));
    }

    @PutMapping("/api/evaluations/{evaluationId}")
    public ResponseEntity<ApiResponse<CoachEvaluationDto>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long evaluationId,
            @Valid @RequestBody EvaluationRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(evaluationService.update(user, evaluationId, request)));
    }

    @DeleteMapping("/api/evaluations/{evaluationId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long evaluationId) {
        User user = currentUserService.getUser(userDetails);
        evaluationService.delete(user, evaluationId);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Evaluation deleted").build());
    }
}
