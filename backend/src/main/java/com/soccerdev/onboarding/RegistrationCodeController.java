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
@RequestMapping("/api/admin/registration-codes")
@RequiredArgsConstructor
public class RegistrationCodeController {

    private final RegistrationCodeService registrationCodeService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationCodeResponse>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid RegistrationCodeInput input) {
        User admin = currentUserService.getUser(userDetails);
        RegistrationCodeResponse response = registrationCodeService.create(admin, input);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration code created", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistrationCodeResponse>>> list(
            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = currentUserService.getUser(userDetails);
        List<RegistrationCodeResponse> response = registrationCodeService.list(admin);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<ApiResponse<RegistrationCodeResponse>> disable(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User admin = currentUserService.getUser(userDetails);
        RegistrationCodeResponse response = registrationCodeService.disable(admin, id);
        return ResponseEntity.ok(ApiResponse.ok("Registration code disabled", response));
    }
}
