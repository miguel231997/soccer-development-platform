package com.soccerdev.player;

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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;
    private final PlayerImageService playerImageService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlayerResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(playerService.list(user)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlayerResponse>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(playerService.getById(user, id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PlayerResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody PlayerRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(playerService.create(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PlayerResponse>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody PlayerRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(playerService.update(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = currentUserService.getUser(userDetails);
        playerService.delete(user, id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Player deactivated").build());
    }

    @PostMapping("/{playerId}/profile-image")
    public ResponseEntity<ApiResponse<PlayerResponse>> uploadProfileImage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long playerId,
            @RequestParam("file") MultipartFile file) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(playerImageService.uploadProfileImage(user, playerId, file)));
    }
}
