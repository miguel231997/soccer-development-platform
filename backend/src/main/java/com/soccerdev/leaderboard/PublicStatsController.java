package com.soccerdev.leaderboard;

import com.soccerdev.common.ApiResponse;
import com.soccerdev.player.Position;
import com.soccerdev.team.AgeGroup;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PublicStatsController {

    private final PublicStatsService publicStatsService;

    @GetMapping("/api/public/stats")
    public ResponseEntity<ApiResponse<List<PlayerLeaderboardEntry>>> leaderboard(
            @RequestParam(required = false) Long seasonId,
            @RequestParam(required = false) Long seasonPhaseId,
            @RequestParam(required = false) Long competitionId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) Long clubId,
            @RequestParam(required = false) AgeGroup ageGroup,
            @RequestParam(required = false) Position position,
            @RequestParam(required = false) LeaderboardScope scope,
            @RequestParam(defaultValue = "GOALS") LeaderboardStat stat,
            @RequestParam(defaultValue = "1") int minAppearances) {
        return ResponseEntity.ok(ApiResponse.ok(publicStatsService.getLeaderboard(
                seasonId, seasonPhaseId, competitionId, teamId, clubId,
                ageGroup, position, stat, minAppearances)));
    }

    @GetMapping("/api/public/stats/top-scorers")
    public ResponseEntity<ApiResponse<List<PlayerLeaderboardEntry>>> topScorers(
            @RequestParam(required = false) Long seasonId,
            @RequestParam(required = false) Long seasonPhaseId,
            @RequestParam(required = false) Long competitionId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) Long clubId,
            @RequestParam(required = false) AgeGroup ageGroup,
            @RequestParam(required = false) Position position,
            @RequestParam(defaultValue = "1") int minAppearances) {
        return ResponseEntity.ok(ApiResponse.ok(publicStatsService.getLeaderboard(
                seasonId, seasonPhaseId, competitionId, teamId, clubId,
                ageGroup, position, LeaderboardStat.GOALS, minAppearances)));
    }

    @GetMapping("/api/public/stats/top-assists")
    public ResponseEntity<ApiResponse<List<PlayerLeaderboardEntry>>> topAssists(
            @RequestParam(required = false) Long seasonId,
            @RequestParam(required = false) Long seasonPhaseId,
            @RequestParam(required = false) Long competitionId,
            @RequestParam(required = false) Long teamId,
            @RequestParam(required = false) Long clubId,
            @RequestParam(required = false) AgeGroup ageGroup,
            @RequestParam(required = false) Position position,
            @RequestParam(defaultValue = "1") int minAppearances) {
        return ResponseEntity.ok(ApiResponse.ok(publicStatsService.getLeaderboard(
                seasonId, seasonPhaseId, competitionId, teamId, clubId,
                ageGroup, position, LeaderboardStat.ASSISTS, minAppearances)));
    }

    @GetMapping("/api/public/players/{playerId}")
    public ResponseEntity<ApiResponse<PublicPlayerProfile>> getPublicPlayer(
            @PathVariable Long playerId) {
        return ResponseEntity.ok(ApiResponse.ok(publicStatsService.getPublicPlayerProfile(playerId)));
    }

    @GetMapping("/api/public/teams/{teamId}/stats")
    public ResponseEntity<ApiResponse<PublicTeamStats>> getTeamStats(
            @PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.ok(publicStatsService.getPublicTeamStats(teamId)));
    }
}
