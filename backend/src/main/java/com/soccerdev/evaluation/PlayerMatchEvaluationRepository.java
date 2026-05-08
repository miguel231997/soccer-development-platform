package com.soccerdev.evaluation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerMatchEvaluationRepository extends JpaRepository<PlayerMatchEvaluation, Long> {

    List<PlayerMatchEvaluation> findByMatchId(Long matchId);

    List<PlayerMatchEvaluation> findByPlayerId(Long playerId);

    List<PlayerMatchEvaluation> findByPlayerIdAndMatchSeasonId(Long playerId, Long seasonId);

    Optional<PlayerMatchEvaluation> findByMatchIdAndPlayerIdAndCoachUserId(Long matchId, Long playerId, Long coachUserId);
}
