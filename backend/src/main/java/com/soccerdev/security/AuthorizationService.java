package com.soccerdev.security;

import com.soccerdev.evaluation.PlayerMatchEvaluation;
import com.soccerdev.evaluation.PlayerMatchEvaluationRepository;
import com.soccerdev.match.Match;
import com.soccerdev.match.MatchRepository;
import com.soccerdev.player.ParentPlayerRelationshipRepository;
import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.report.DevelopmentReport;
import com.soccerdev.report.DevelopmentReportRepository;
import com.soccerdev.team.CoachTeamAssignmentRepository;
import com.soccerdev.team.PlayerTeamAssignmentRepository;
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthorizationService {

    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final MatchRepository matchRepository;
    private final PlayerMatchEvaluationRepository evaluationRepository;
    private final DevelopmentReportRepository reportRepository;
    private final CoachTeamAssignmentRepository coachTeamAssignmentRepository;
    private final ParentPlayerRelationshipRepository parentPlayerRelationshipRepository;
    private final PlayerTeamAssignmentRepository playerTeamAssignmentRepository;

    // ── Club ─────────────────────────────────────────────────────────────────

    public boolean canViewClub(User user, Long clubId) {
        if (isAdmin(user)) return true;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorOf(user, clubId);
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamClubId(user.getId(), clubId);
            case PARENT   -> {
                Set<Long> playerIds = parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(user.getId());
                yield !playerIds.isEmpty() &&
                        playerTeamAssignmentRepository.existsByPlayerIdInAndTeamClubIdAndActiveTrue(playerIds, clubId);
            }
            default -> false;
        };
    }

    public boolean canEditClub(User user, Long clubId) {
        if (isAdmin(user)) return true;
        return user.getRole() == UserRole.DIRECTOR && isDirectorOf(user, clubId);
    }

    // ── Player ───────────────────────────────────────────────────────────────

    public boolean canViewPlayer(User user, Long playerId) {
        if (isAdmin(user)) return true;
        return switch (user.getRole()) {
            case PARENT   -> parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(user.getId(), playerId);
            case DIRECTOR -> user.getClub() != null &&
                    playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(playerId, user.getClub().getId());
            case COACH    -> playerTeamAssignmentRepository.existsByPlayerIdAndCoachUserId(playerId, user.getId());
            default       -> false;
        };
    }

    public boolean canEditPlayer(User user, Long playerId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> user.getClub() != null &&
                    playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(playerId, user.getClub().getId());
            case COACH    -> playerTeamAssignmentRepository.existsByPlayerIdAndCoachUserId(playerId, user.getId());
            default       -> false;
        };
    }

    // ── Team ─────────────────────────────────────────────────────────────────

    public boolean canViewTeam(User user, Long teamId) {
        if (isAdmin(user)) return true;
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorOf(user, team.getClub().getId());
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), teamId);
            case PARENT   -> {
                Set<Long> playerIds = parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(user.getId());
                yield !playerIds.isEmpty() &&
                        playerTeamAssignmentRepository.existsByPlayerIdInAndTeamIdAndActiveTrue(playerIds, teamId);
            }
            default -> false;
        };
    }

    public boolean canEditTeam(User user, Long teamId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorOf(user, team.getClub().getId());
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), teamId);
            default       -> false;
        };
    }

    // ── Match ─────────────────────────────────────────────────────────────────

    public boolean canViewMatch(User user, Long matchId) {
        if (isAdmin(user)) return true;
        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) return false;
        Long matchTeamId = match.getTeam().getId();
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorOf(user, match.getTeam().getClub().getId());
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), matchTeamId);
            case PARENT   -> {
                Set<Long> playerIds = parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(user.getId());
                yield !playerIds.isEmpty() &&
                        playerTeamAssignmentRepository.existsByPlayerIdInAndTeamIdAndActiveTrue(playerIds, matchTeamId);
            }
            default -> false;
        };
    }

    public boolean canEditMatch(User user, Long matchId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) return false;
        Long matchTeamId = match.getTeam().getId();
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorOf(user, match.getTeam().getClub().getId());
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), matchTeamId);
            default       -> false;
        };
    }

    // ── Evaluation ───────────────────────────────────────────────────────────

    public boolean canViewEvaluation(User user, Long evaluationId) {
        if (isAdmin(user)) return true;
        PlayerMatchEvaluation eval = evaluationRepository.findById(evaluationId).orElse(null);
        if (eval == null) return false;
        Long playerId = eval.getPlayer().getId();
        return switch (user.getRole()) {
            case DIRECTOR -> user.getClub() != null &&
                    playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(playerId, user.getClub().getId());
            case COACH    -> user.getId().equals(eval.getCoachUser().getId())
                    || coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(
                            user.getId(), eval.getMatch().getTeam().getId());
            case PARENT   -> parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(user.getId(), playerId);
            default       -> false;
        };
    }

    public boolean canEditEvaluation(User user, Long evaluationId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        PlayerMatchEvaluation eval = evaluationRepository.findById(evaluationId).orElse(null);
        if (eval == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> user.getClub() != null &&
                    playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(
                            eval.getPlayer().getId(), user.getClub().getId());
            case COACH    -> user.getId().equals(eval.getCoachUser().getId());
            default       -> false;
        };
    }

    // ── Development Report ───────────────────────────────────────────────────

    public boolean canViewDevelopmentReport(User user, Long reportId) {
        if (isAdmin(user)) return true;
        DevelopmentReport report = reportRepository.findById(reportId).orElse(null);
        if (report == null) return false;
        Long playerId = report.getPlayer().getId();
        return switch (user.getRole()) {
            case DIRECTOR -> user.getClub() != null &&
                    playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(playerId, user.getClub().getId());
            case COACH    -> playerTeamAssignmentRepository.existsByPlayerIdAndCoachUserId(playerId, user.getId());
            case PARENT   -> report.isApprovedForParent()
                    && parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(user.getId(), playerId);
            default       -> false;
        };
    }

    public boolean canEditDevelopmentReport(User user, Long reportId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        DevelopmentReport report = reportRepository.findById(reportId).orElse(null);
        if (report == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> user.getClub() != null &&
                    playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(
                            report.getPlayer().getId(), user.getClub().getId());
            case COACH    -> user.getId().equals(report.getGeneratedByUser().getId());
            default       -> false;
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.ADMIN;
    }

    private boolean isDirectorOf(User director, Long clubId) {
        return director.getClub() != null && director.getClub().getId().equals(clubId);
    }

    /** Returns true if the user can review registration requests for the given team. */
    public boolean canReviewForTeam(User user, Long teamId, Long teamClubId) {
        if (isAdmin(user)) return true;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorOf(user, teamClubId);
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), teamId);
            default       -> false;
        };
    }
}
