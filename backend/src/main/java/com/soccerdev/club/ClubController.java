package com.soccerdev.club;

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
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClubResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(clubService.list(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(clubService.getById(user, id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClubResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ClubRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(clubService.create(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClubResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ClubRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(clubService.update(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        clubService.delete(user, id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Club deleted").build());
    }
}
