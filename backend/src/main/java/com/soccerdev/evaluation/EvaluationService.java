package com.soccerdev.evaluation;

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
public class EvaluationService {

    private final PlayerMatchEvaluationRepository evaluationRepository;
    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final ParentPlayerRelationshipRepository parentPlayerRelationshipRepository;
    private final AuthorizationService authorizationService;
    private final PlayerTeamAssignmentRepository playerTeamAssignmentRepository;

    @Transactional
    public CoachEvaluationDto create(User coach, Long matchId, Long playerId, EvaluationRequest request) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new EntityNotFoundException("Match not found with id: " + matchId));
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + playerId));

        if (!authorizationService.canEditMatch(coach, matchId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (!playerTeamAssignmentRepository.existsByPlayerIdAndTeamIdAndActiveTrue(playerId, match.getTeam().getId())) {
            throw new IllegalArgumentException("Player does not belong to the match team");
        }

        if (evaluationRepository.findByMatchIdAndPlayerIdAndCoachUserId(matchId, playerId, coach.getId()).isPresent()) {
            throw new IllegalArgumentException("An evaluation for this match/player already exists from this coach");
        }

        PlayerMatchEvaluation eval = PlayerMatchEvaluation.builder()
                .match(match)
                .player(player)
                .coachUser(coach)
                .build();
        applyRequest(eval, request);

        return toCoachDto(evaluationRepository.save(eval));
    }

    public List<EvaluationView> getByMatch(User user, Long matchId) {
        if (!matchRepository.existsById(matchId)) {
            throw new EntityNotFoundException("Match not found with id: " + matchId);
        }
        if (!authorizationService.canViewMatch(user, matchId)) {
            throw new AccessDeniedException("Access denied");
        }

        List<PlayerMatchEvaluation> evals = evaluationRepository.findByMatchId(matchId);

        if (user.getRole() == UserRole.PARENT) {
            var linkedIds = parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(user.getId());
            return evals.stream()
                    .filter(e -> linkedIds.contains(e.getPlayer().getId()))
                    .map(e -> (EvaluationView) toParentDto(e))
                    .toList();
        }
        return evals.stream().map(e -> (EvaluationView) toCoachDto(e)).toList();
    }

    public List<EvaluationView> getByPlayer(User user, Long playerId) {
        if (!playerRepository.existsById(playerId)) {
            throw new EntityNotFoundException("Player not found with id: " + playerId);
        }
        if (!authorizationService.canViewPlayer(user, playerId)) {
            throw new AccessDeniedException("Access denied");
        }

        List<PlayerMatchEvaluation> evals = evaluationRepository.findByPlayerId(playerId);

        if (user.getRole() == UserRole.PARENT) {
            return evals.stream().map(e -> (EvaluationView) toParentDto(e)).toList();
        }
        return evals.stream().map(e -> (EvaluationView) toCoachDto(e)).toList();
    }

    public EvaluationView getById(User user, Long evaluationId) {
        PlayerMatchEvaluation eval = findOrThrow(evaluationId);
        if (!authorizationService.canViewEvaluation(user, evaluationId)) {
            throw new AccessDeniedException("Access denied");
        }
        if (user.getRole() == UserRole.PARENT) {
            return toParentDto(eval);
        }
        return toCoachDto(eval);
    }

    @Transactional
    public CoachEvaluationDto update(User user, Long evaluationId, EvaluationRequest request) {
        PlayerMatchEvaluation eval = findOrThrow(evaluationId);
        if (!authorizationService.canEditEvaluation(user, evaluationId)) {
            throw new AccessDeniedException("Access denied");
        }
        applyRequest(eval, request);
        return toCoachDto(evaluationRepository.save(eval));
    }

    @Transactional
    public void delete(User user, Long evaluationId) {
        findOrThrow(evaluationId);
        if (!authorizationService.canEditEvaluation(user, evaluationId)) {
            throw new AccessDeniedException("Access denied");
        }
        evaluationRepository.deleteById(evaluationId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void applyRequest(PlayerMatchEvaluation eval, EvaluationRequest req) {
        eval.setPositionPlayed(req.getPositionPlayed());
        eval.setTechnicalRating(req.getTechnicalRating());
        eval.setTacticalRating(req.getTacticalRating());
        eval.setPhysicalRating(req.getPhysicalRating());
        eval.setMentalityRating(req.getMentalityRating());
        eval.setAttackingRating(req.getAttackingRating());
        eval.setDefendingRating(req.getDefendingRating());
        eval.setDecisionMakingRating(req.getDecisionMakingRating());
        eval.setWorkRateRating(req.getWorkRateRating());
        eval.setOverallRating(req.getOverallRating());
        eval.setParentVisibleNotes(req.getParentVisibleNotes());
        eval.setCoachOnlyNotes(req.getCoachOnlyNotes());
    }

    private CoachEvaluationDto toCoachDto(PlayerMatchEvaluation eval) {
        return CoachEvaluationDto.builder()
                .id(eval.getId())
                .matchId(eval.getMatch().getId())
                .opponent(eval.getMatch().getOpponent())
                .matchDateTime(eval.getMatch().getMatchDateTime())
                .playerId(eval.getPlayer().getId())
                .playerName(eval.getPlayer().getFirstName() + " " + eval.getPlayer().getLastName())
                .coachUserId(eval.getCoachUser().getId())
                .coachName(eval.getCoachUser().getFirstName() + " " + eval.getCoachUser().getLastName())
                .positionPlayed(eval.getPositionPlayed())
                .technicalRating(eval.getTechnicalRating())
                .tacticalRating(eval.getTacticalRating())
                .physicalRating(eval.getPhysicalRating())
                .mentalityRating(eval.getMentalityRating())
                .attackingRating(eval.getAttackingRating())
                .defendingRating(eval.getDefendingRating())
                .decisionMakingRating(eval.getDecisionMakingRating())
                .workRateRating(eval.getWorkRateRating())
                .overallRating(eval.getOverallRating())
                .parentVisibleNotes(eval.getParentVisibleNotes())
                .coachOnlyNotes(eval.getCoachOnlyNotes())
                .createdAt(eval.getCreatedAt())
                .updatedAt(eval.getUpdatedAt())
                .build();
    }

    private ParentEvaluationDto toParentDto(PlayerMatchEvaluation eval) {
        var team = eval.getMatch().getTeam();
        return ParentEvaluationDto.builder()
                .id(eval.getId())
                .matchId(eval.getMatch().getId())
                .teamId(team != null ? team.getId() : null)
                .teamName(team != null ? team.getName() : null)
                .opponent(eval.getMatch().getOpponent())
                .matchDateTime(eval.getMatch().getMatchDateTime())
                .playerId(eval.getPlayer().getId())
                .playerName(eval.getPlayer().getFirstName() + " " + eval.getPlayer().getLastName())
                .positionPlayed(eval.getPositionPlayed())
                .technicalRating(eval.getTechnicalRating())
                .tacticalRating(eval.getTacticalRating())
                .physicalRating(eval.getPhysicalRating())
                .mentalityRating(eval.getMentalityRating())
                .attackingRating(eval.getAttackingRating())
                .defendingRating(eval.getDefendingRating())
                .decisionMakingRating(eval.getDecisionMakingRating())
                .workRateRating(eval.getWorkRateRating())
                .overallRating(eval.getOverallRating())
                .parentVisibleNotes(eval.getParentVisibleNotes())
                .createdAt(eval.getCreatedAt())
                .updatedAt(eval.getUpdatedAt())
                .build();
    }

    private PlayerMatchEvaluation findOrThrow(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evaluation not found with id: " + id));
    }
}
