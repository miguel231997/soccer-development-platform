package com.soccerdev.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    @Query("""
            SELECT DISTINCT p FROM Player p
            LEFT JOIN FETCH p.teamAssignments ta
            LEFT JOIN FETCH ta.team t
            LEFT JOIN FETCH t.club
            LEFT JOIN FETCH ta.season
            """)
    List<Player> findAllWithTeams();

    @Query("""
            SELECT DISTINCT p FROM Player p
            LEFT JOIN FETCH p.teamAssignments ta
            LEFT JOIN FETCH ta.team t
            LEFT JOIN FETCH t.club
            LEFT JOIN FETCH ta.season
            WHERE EXISTS (
                SELECT 1 FROM PlayerTeamAssignment pta2
                WHERE pta2.player.id = p.id AND pta2.team.id = :teamId AND pta2.active = true
            )
            """)
    List<Player> findByTeamId(@Param("teamId") Long teamId);

    @Query("""
            SELECT DISTINCT p FROM Player p
            LEFT JOIN FETCH p.teamAssignments ta
            LEFT JOIN FETCH ta.team t
            LEFT JOIN FETCH t.club
            LEFT JOIN FETCH ta.season
            WHERE EXISTS (
                SELECT 1 FROM PlayerTeamAssignment pta2
                WHERE pta2.player.id = p.id AND pta2.team.club.id = :clubId AND pta2.active = true
            )
            """)
    List<Player> findByTeamClubId(@Param("clubId") Long clubId);

    @Query("""
            SELECT DISTINCT p FROM Player p
            LEFT JOIN FETCH p.teamAssignments ta
            LEFT JOIN FETCH ta.team t
            LEFT JOIN FETCH t.club
            LEFT JOIN FETCH ta.season
            WHERE EXISTS (
                SELECT 1 FROM PlayerTeamAssignment pta2
                WHERE pta2.player.id = p.id AND pta2.active = true
                AND pta2.team.id IN (
                    SELECT cta.team.id FROM CoachTeamAssignment cta WHERE cta.coachUser.id = :coachId
                )
            )
            """)
    List<Player> findByAssignedCoachId(@Param("coachId") Long coachId);

    @Query("""
            SELECT DISTINCT p FROM Player p
            LEFT JOIN FETCH p.teamAssignments ta
            LEFT JOIN FETCH ta.team t
            LEFT JOIN FETCH t.club
            LEFT JOIN FETCH ta.season
            WHERE p.id IN (
                SELECT ppr.player.id FROM ParentPlayerRelationship ppr WHERE ppr.parentUser.id = :parentId
            )
            """)
    List<Player> findByParentId(@Param("parentId") Long parentId);

    @Query("""
            SELECT DISTINCT p FROM Player p
            LEFT JOIN FETCH p.teamAssignments ta
            LEFT JOIN FETCH ta.team t
            LEFT JOIN FETCH t.club
            LEFT JOIN FETCH ta.season
            WHERE p.id = :id
            """)
    Optional<Player> findByIdWithTeams(@Param("id") Long id);

    Optional<Player> findByIdAndPublicProfileEnabledTrueAndActiveTrue(Long id);
}
