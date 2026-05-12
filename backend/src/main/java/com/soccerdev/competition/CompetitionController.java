package com.soccerdev.competition;

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
@RequestMapping("/api/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompetitionResponse>>> list(
            @RequestParam(required = false) String state) {
        return ResponseEntity.ok(ApiResponse.ok(competitionService.list(state)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompetitionResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CompetitionRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(competitionService.create(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompetitionResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CompetitionRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(competitionService.update(user, id, request)));
    }
}
