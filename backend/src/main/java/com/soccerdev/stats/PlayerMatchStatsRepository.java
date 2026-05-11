package com.soccerdev.stats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerMatchStatsRepository extends JpaRepository<PlayerMatchStats, Long> {

    List<PlayerMatchStats> findByMatchId(Long matchId);

    List<PlayerMatchStats> findByPlayerId(Long playerId);

    Optional<PlayerMatchStats> findByMatchIdAndPlayerId(Long matchId, Long playerId);

    @Query("""
            SELECT s FROM PlayerMatchStats s
            JOIN FETCH s.player p
            JOIN FETCH p.team t
            JOIN FETCH t.club c
            JOIN s.match m
            LEFT JOIN m.seasonPhase msp
            LEFT JOIN m.competition mc
            WHERE p.publicProfileEnabled = true
              AND p.active = true
              AND (:seasonId IS NULL OR m.season.id = :seasonId)
              AND (:seasonPhaseId IS NULL OR msp.id = :seasonPhaseId)
              AND (:competitionId IS NULL OR mc.id = :competitionId)
              AND (:teamId IS NULL OR t.id = :teamId)
              AND (:clubId IS NULL OR c.id = :clubId)
            """)
    List<PlayerMatchStats> findPublicStats(
            @Param("seasonId") Long seasonId,
            @Param("seasonPhaseId") Long seasonPhaseId,
            @Param("competitionId") Long competitionId,
            @Param("teamId") Long teamId,
            @Param("clubId") Long clubId);
}
