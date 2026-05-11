package com.soccerdev.evaluation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerMatchEvaluationRepository extends JpaRepository<PlayerMatchEvaluation, Long> {

    @Query("""
            SELECT e FROM PlayerMatchEvaluation e
            JOIN FETCH e.match
            JOIN FETCH e.player
            JOIN FETCH e.coachUser
            WHERE e.match.id = :matchId
            """)
    List<PlayerMatchEvaluation> findByMatchId(@Param("matchId") Long matchId);

    @Query("""
            SELECT e FROM PlayerMatchEvaluation e
            JOIN FETCH e.match
            JOIN FETCH e.player
            JOIN FETCH e.coachUser
            WHERE e.player.id = :playerId
            """)
    List<PlayerMatchEvaluation> findByPlayerId(@Param("playerId") Long playerId);

    List<PlayerMatchEvaluation> findByPlayerIdAndMatchSeasonId(Long playerId, Long seasonId);

    Optional<PlayerMatchEvaluation> findByMatchIdAndPlayerIdAndCoachUserId(Long matchId, Long playerId, Long coachUserId);
}
