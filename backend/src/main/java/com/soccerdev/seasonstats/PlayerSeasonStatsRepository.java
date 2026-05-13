package com.soccerdev.seasonstats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PlayerSeasonStatsRepository extends JpaRepository<PlayerSeasonStats, Long> {

    @Query("SELECT s FROM PlayerSeasonStats s LEFT JOIN FETCH s.season JOIN FETCH s.team WHERE s.player.id = :playerId ORDER BY s.createdAt DESC")
    List<PlayerSeasonStats> findByPlayerIdOrderByCreatedAtDesc(@Param("playerId") Long playerId);

    @Query("SELECT s FROM PlayerSeasonStats s WHERE s.team.id = :teamId AND s.season.id = :seasonId")
    List<PlayerSeasonStats> findByTeamAndSeason(@Param("teamId") Long teamId, @Param("seasonId") Long seasonId);

    @Query("SELECT s FROM PlayerSeasonStats s WHERE s.team.id = :teamId AND s.season IS NULL")
    List<PlayerSeasonStats> findByTeamAndNoSeason(@Param("teamId") Long teamId);

    @Query("SELECT s FROM PlayerSeasonStats s JOIN FETCH s.player p JOIN FETCH s.team t LEFT JOIN FETCH t.club LEFT JOIN FETCH s.season WHERE p.publicProfileEnabled = true AND p.active = true")
    List<PlayerSeasonStats> findAllPublicPlayerStats();
}
