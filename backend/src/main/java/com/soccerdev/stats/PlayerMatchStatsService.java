package com.soccerdev.stats;

import com.soccerdev.match.Match;
import com.soccerdev.match.MatchRepository;
import com.soccerdev.player.ParentPlayerRelationshipRepository;
import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.security.AuthorizationService;
import com.soccerdev.team.PlayerTeamAssignmentRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerMatchStatsService {

    private final PlayerMatchStatsRepository statsRepository;
    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final ParentPlayerRelationshipRepository parentPlayerRelationshipRepository;
    private final AuthorizationService authorizationService;
    private final PlayerTeamAssignmentRepository playerTeamAssignmentRepository;

    public List<PlayerMatchStatsResponse> getByMatch(User user, Long matchId) {
        if (!matchRepository.existsById(matchId)) {
            throw new EntityNotFoundException("Match not found with id: " + matchId);
        }
        if (!authorizationService.canViewMatch(user, matchId)) {
            throw new AccessDeniedException("Access denied");
        }
        List<PlayerMatchStats> stats = statsRepository.findByMatchId(matchId);
        if (user.getRole() == UserRole.PARENT) {
            var linkedIds = parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(user.getId());
            stats = stats.stream()
                    .filter(s -> linkedIds.contains(s.getPlayer().getId()))
                    .toList();
        }
        return stats.stream().map(this::toResponse).toList();
    }

    public List<PlayerMatchStatsResponse> getByPlayer(User user, Long playerId) {
        if (!playerRepository.existsById(playerId)) {
            throw new EntityNotFoundException("Player not found with id: " + playerId);
        }
        if (!authorizationService.canViewPlayer(user, playerId)) {
            throw new AccessDeniedException("Access denied");
        }
        return statsRepository.findByPlayerId(playerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PlayerMatchStatsResponse upsert(User user, Long matchId, Long playerId, PlayerMatchStatsRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Match not found with id: " + matchId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + playerId));

        if (!authorizationService.canEditMatch(user, matchId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (match.isFinalized()) {
            throw new IllegalArgumentException("Cannot update stats for a finalized match");
        }

        if (!playerTeamAssignmentRepository.existsByPlayerIdAndTeamIdAndActiveTrue(player.getId(), match.getTeam().getId())) {
            throw new IllegalArgumentException("Player does not belong to the match team");
        }

        PlayerMatchStats stats = statsRepository.findByMatchIdAndPlayerId(matchId, playerId)
                .orElseGet(PlayerMatchStats::new);

        stats.setMatch(match);
        stats.setPlayer(player);
        applyRequest(stats, request);

        return toResponse(statsRepository.save(stats));
    }

    private void applyRequest(PlayerMatchStats stats, PlayerMatchStatsRequest req) {
        stats.setMinutesPlayed(req.getMinutesPlayed());
        stats.setGoals(req.getGoals() != null ? req.getGoals() : 0);
        stats.setAssists(req.getAssists() != null ? req.getAssists() : 0);
        stats.setShots(req.getShots() != null ? req.getShots() : 0);
        stats.setShotsOnTarget(req.getShotsOnTarget() != null ? req.getShotsOnTarget() : 0);
        stats.setSaves(req.getSaves() != null ? req.getSaves() : 0);
        stats.setCleanSheet(Boolean.TRUE.equals(req.getCleanSheet()));
        stats.setXg(req.getXg());
        stats.setXa(req.getXa());
        stats.setXt(req.getXt());
        stats.setDangerPrevented(req.getDangerPrevented());
    }

    private PlayerMatchStatsResponse toResponse(PlayerMatchStats stats) {
        return PlayerMatchStatsResponse.builder()
                .id(stats.getId())
                .matchId(stats.getMatch().getId())
                .opponent(stats.getMatch().getOpponent())
                .matchDateTime(stats.getMatch().getMatchDateTime())
                .playerId(stats.getPlayer().getId())
                .playerName(stats.getPlayer().getFirstName() + " " + stats.getPlayer().getLastName())
                .minutesPlayed(stats.getMinutesPlayed())
                .goals(stats.getGoals())
                .assists(stats.getAssists())
                .shots(stats.getShots())
                .shotsOnTarget(stats.getShotsOnTarget())
                .saves(stats.getSaves())
                .cleanSheet(stats.isCleanSheet())
                .xg(stats.getXg())
                .xa(stats.getXa())
                .xt(stats.getXt())
                .dangerPrevented(stats.getDangerPrevented())
                .createdAt(stats.getCreatedAt())
                .updatedAt(stats.getUpdatedAt())
                .build();
    }
}
