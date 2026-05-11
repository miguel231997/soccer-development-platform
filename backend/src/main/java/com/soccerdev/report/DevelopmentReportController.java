package com.soccerdev.report;

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
public class DevelopmentReportController {

    private final DevelopmentReportService reportService;
    private final CurrentUserService currentUserService;

    @PostMapping("/api/players/{playerId}/reports")
    public ResponseEntity<ApiResponse<CoachDevelopmentReportDto>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long playerId,
            @Valid @RequestBody ReportRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(reportService.create(user, playerId, request)));
    }

    @GetMapping("/api/players/{playerId}/reports")
    public ResponseEntity<ApiResponse<List<ReportView>>> listByPlayer(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long playerId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(reportService.listByPlayer(user, playerId)));
    }

    @GetMapping("/api/reports/{reportId}")
    public ResponseEntity<ApiResponse<ReportView>> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reportId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(reportService.getById(user, reportId)));
    }

    @PutMapping("/api/reports/{reportId}")
    public ResponseEntity<ApiResponse<CoachDevelopmentReportDto>> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reportId,
            @Valid @RequestBody ReportRequest request) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(reportService.update(user, reportId, request)));
    }

    @PostMapping("/api/reports/{reportId}/approve")
    public ResponseEntity<ApiResponse<CoachDevelopmentReportDto>> approve(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reportId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(reportService.approve(user, reportId)));
    }

    @PostMapping("/api/reports/{reportId}/unapprove")
    public ResponseEntity<ApiResponse<CoachDevelopmentReportDto>> unapprove(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long reportId) {
        User user = currentUserService.getUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(reportService.unapprove(user, reportId)));
    }
}
