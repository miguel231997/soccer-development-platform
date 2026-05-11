package com.soccerdev.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Set;

@Repository
public interface PlayerTeamAssignmentRepository extends JpaRepository<PlayerTeamAssignment, Long> {

    @Query("""
            SELECT COUNT(pta) > 0 FROM PlayerTeamAssignment pta
            WHERE pta.player.id = :playerId AND pta.active = true
            AND pta.team.id IN (
                SELECT cta.team.id FROM CoachTeamAssignment cta WHERE cta.coachUser.id = :coachUserId
            )
            """)
    boolean existsByPlayerIdAndCoachUserId(
            @Param("playerId") Long playerId,
            @Param("coachUserId") Long coachUserId);

    @Query("""
            SELECT COUNT(pta) > 0 FROM PlayerTeamAssignment pta
            WHERE pta.player.id = :playerId AND pta.active = true AND pta.team.club.id = :clubId
            """)
    boolean existsByPlayerIdAndTeamClubIdAndActiveTrue(
            @Param("playerId") Long playerId,
            @Param("clubId") Long clubId);

    @Query("""
            SELECT COUNT(pta) > 0 FROM PlayerTeamAssignment pta
            WHERE pta.player.id IN :playerIds AND pta.team.id = :teamId AND pta.active = true
            """)
    boolean existsByPlayerIdInAndTeamIdAndActiveTrue(
            @Param("playerIds") Set<Long> playerIds,
            @Param("teamId") Long teamId);

    @Query("""
            SELECT COUNT(pta) > 0 FROM PlayerTeamAssignment pta
            WHERE pta.player.id IN :playerIds AND pta.team.club.id = :clubId AND pta.active = true
            """)
    boolean existsByPlayerIdInAndTeamClubIdAndActiveTrue(
            @Param("playerIds") Set<Long> playerIds,
            @Param("clubId") Long clubId);

    @Query("""
            SELECT COUNT(pta) > 0 FROM PlayerTeamAssignment pta
            WHERE pta.player.id IN :playerIds AND pta.team.id = :teamId AND pta.active = true
            """)
    boolean existsByPlayerIdInAndTeamId(
            @Param("playerIds") Set<Long> playerIds,
            @Param("teamId") Long teamId);

    boolean existsByPlayerIdAndTeamIdAndActiveTrue(Long playerId, Long teamId);
}
