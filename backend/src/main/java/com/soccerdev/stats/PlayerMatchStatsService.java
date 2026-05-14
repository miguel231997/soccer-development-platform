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

        if (user.getRole() == UserRole.PARENT) {
            if (!parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(user.getId(), playerId)) {
                throw new AccessDeniedException("Access denied");
            }
            if (!authorizationService.canViewMatch(user, matchId)) {
                throw new AccessDeniedException("Access denied");
            }
        } else {
            if (!authorizationService.canEditMatch(user, matchId)) {
                throw new AccessDeniedException("Access denied");
            }
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
        stats.setSuccessfulPasses(req.getSuccessfulPasses() != null ? req.getSuccessfulPasses() : 0);
        stats.setAccurateLongBalls(req.getAccurateLongBalls() != null ? req.getAccurateLongBalls() : 0);
        stats.setChancesCreated(req.getChancesCreated() != null ? req.getChancesCreated() : 0);
        stats.setSuccessfulCrosses(req.getSuccessfulCrosses() != null ? req.getSuccessfulCrosses() : 0);
        stats.setSuccessfulDribbles(req.getSuccessfulDribbles() != null ? req.getSuccessfulDribbles() : 0);
        stats.setDuelsWon(req.getDuelsWon() != null ? req.getDuelsWon() : 0);
        stats.setDispossessed(req.getDispossessed() != null ? req.getDispossessed() : 0);
        stats.setFoulsWon(req.getFoulsWon() != null ? req.getFoulsWon() : 0);
        stats.setTackles(req.getTackles() != null ? req.getTackles() : 0);
        stats.setInterceptions(req.getInterceptions() != null ? req.getInterceptions() : 0);
        stats.setFoulsCommitted(req.getFoulsCommitted() != null ? req.getFoulsCommitted() : 0);
        stats.setBlockedShots(req.getBlockedShots() != null ? req.getBlockedShots() : 0);
        stats.setClearances(req.getClearances() != null ? req.getClearances() : 0);
        stats.setGoalsConceded(req.getGoalsConceded() != null ? req.getGoalsConceded() : 0);
        stats.setYellowCards(req.getYellowCards() != null ? req.getYellowCards() : 0);
        stats.setRedCards(req.getRedCards() != null ? req.getRedCards() : 0);
    }

    private PlayerMatchStatsResponse toResponse(PlayerMatchStats stats) {
        var team = stats.getMatch().getTeam();
        return PlayerMatchStatsResponse.builder()
                .id(stats.getId())
                .matchId(stats.getMatch().getId())
                .teamId(team != null ? team.getId() : null)
                .teamName(team != null ? team.getName() : null)
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
                .successfulPasses(stats.getSuccessfulPasses())
                .accurateLongBalls(stats.getAccurateLongBalls())
                .chancesCreated(stats.getChancesCreated())
                .successfulCrosses(stats.getSuccessfulCrosses())
                .successfulDribbles(stats.getSuccessfulDribbles())
                .duelsWon(stats.getDuelsWon())
                .dispossessed(stats.getDispossessed())
                .foulsWon(stats.getFoulsWon())
                .tackles(stats.getTackles())
                .interceptions(stats.getInterceptions())
                .foulsCommitted(stats.getFoulsCommitted())
                .blockedShots(stats.getBlockedShots())
                .clearances(stats.getClearances())
                .goalsConceded(stats.getGoalsConceded())
                .yellowCards(stats.getYellowCards())
                .redCards(stats.getRedCards())
                .createdAt(stats.getCreatedAt())
                .updatedAt(stats.getUpdatedAt())
                .build();
    }
}
