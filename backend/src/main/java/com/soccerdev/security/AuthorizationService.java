package com.soccerdev.security;

import com.soccerdev.club.Club;
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
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    // ── Player ───────────────────────────────────────────────────────────────

    public boolean canViewPlayer(User user, Long playerId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT) {
            return parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(user.getId(), playerId);
        }
        if (user.getRole() == UserRole.PLAYER) return false;
        Player player = playerRepository.findById(playerId).orElse(null);
        if (player == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, clubOf(player));
            case COACH    -> isAssignedToTeam(user, player.getTeam());
            default       -> false;
        };
    }

    public boolean canEditPlayer(User user, Long playerId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        Player player = playerRepository.findById(playerId).orElse(null);
        if (player == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, clubOf(player));
            case COACH    -> isAssignedToTeam(user, player.getTeam());
            default       -> false;
        };
    }

    // ── Team ─────────────────────────────────────────────────────────────────

    public boolean canViewTeam(User user, Long teamId) {
        if (isAdmin(user)) return true;
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, team.getClub());
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), teamId);
            case PARENT   -> parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerTeamId(user.getId(), teamId);
            default       -> false;
        };
    }

    public boolean canEditTeam(User user, Long teamId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        Team team = teamRepository.findById(teamId).orElse(null);
        if (team == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, team.getClub());
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
            case DIRECTOR -> isDirectorClub(user, match.getTeam().getClub());
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), matchTeamId);
            case PARENT   -> parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerTeamId(user.getId(), matchTeamId);
            default       -> false;
        };
    }

    public boolean canEditMatch(User user, Long matchId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        Match match = matchRepository.findById(matchId).orElse(null);
        if (match == null) return false;
        Long matchTeamId = match.getTeam().getId();
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, match.getTeam().getClub());
            case COACH    -> coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), matchTeamId);
            default       -> false;
        };
    }

    // ── Evaluation ───────────────────────────────────────────────────────────

    public boolean canViewEvaluation(User user, Long evaluationId) {
        if (isAdmin(user)) return true;
        PlayerMatchEvaluation eval = evaluationRepository.findById(evaluationId).orElse(null);
        if (eval == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, clubOf(eval.getPlayer()));
            case COACH    -> user.getId().equals(eval.getCoachUser().getId())
                    || coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(
                            user.getId(), eval.getMatch().getTeam().getId());
            case PARENT   -> parentPlayerRelationshipRepository
                    .existsByParentUserIdAndPlayerId(user.getId(), eval.getPlayer().getId());
            default       -> false;
        };
    }

    public boolean canEditEvaluation(User user, Long evaluationId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        PlayerMatchEvaluation eval = evaluationRepository.findById(evaluationId).orElse(null);
        if (eval == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, clubOf(eval.getPlayer()));
            case COACH    -> user.getId().equals(eval.getCoachUser().getId());
            default       -> false;
        };
    }

    // ── Development Report ───────────────────────────────────────────────────

    public boolean canViewDevelopmentReport(User user, Long reportId) {
        if (isAdmin(user)) return true;
        DevelopmentReport report = reportRepository.findById(reportId).orElse(null);
        if (report == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, clubOf(report.getPlayer()));
            case COACH    -> isAssignedToTeam(user, report.getPlayer().getTeam());
            case PARENT   -> report.isApprovedForParent()
                    && parentPlayerRelationshipRepository
                            .existsByParentUserIdAndPlayerId(user.getId(), report.getPlayer().getId());
            default       -> false;
        };
    }

    public boolean canEditDevelopmentReport(User user, Long reportId) {
        if (isAdmin(user)) return true;
        if (user.getRole() == UserRole.PARENT || user.getRole() == UserRole.PLAYER) return false;
        DevelopmentReport report = reportRepository.findById(reportId).orElse(null);
        if (report == null) return false;
        return switch (user.getRole()) {
            case DIRECTOR -> isDirectorClub(user, clubOf(report.getPlayer()));
            case COACH    -> user.getId().equals(report.getGeneratedByUser().getId());
            default       -> false;
        };
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private boolean isAdmin(User user) {
        return user.getRole() == UserRole.ADMIN;
    }

    private boolean isDirectorClub(User director, Club club) {
        return director.getClub() != null
                && club != null
                && director.getClub().getId().equals(club.getId());
    }

    private boolean isAssignedToTeam(User user, Team team) {
        return team != null
                && coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(user.getId(), team.getId());
    }

    /** Returns the Club of a player's team, or null if the player has no team. */
    private Club clubOf(Player player) {
        if (player == null || player.getTeam() == null) return null;
        return player.getTeam().getClub();
    }
}
