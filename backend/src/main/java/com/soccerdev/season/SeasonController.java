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
@RequestMapping("/api/seasons")
@RequiredArgsConstructor
public class SeasonController {

    private final SeasonService seasonService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeasonResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(seasonService.list()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<SeasonResponse>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(seasonService.getActive()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeasonResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SeasonRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(seasonService.create(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SeasonResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SeasonRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(seasonService.update(user, id, request)));
    }
}
