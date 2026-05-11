package com.soccerdev.match;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    @Query("""
            SELECT m FROM Match m
            JOIN FETCH m.team t JOIN FETCH t.club
            JOIN FETCH m.season
            LEFT JOIN FETCH m.seasonPhase
            LEFT JOIN FETCH m.competition
            WHERE t.id = :teamId
            ORDER BY m.matchDateTime DESC
            """)
    List<Match> findByTeamIdOrderByMatchDateTimeDesc(@Param("teamId") Long teamId);

    List<Match> findByTeamIdAndSeasonId(Long teamId, Long seasonId);

    List<Match> findByTeamIdAndSeasonIdAndFinalized(Long teamId, Long seasonId, boolean finalized);

    List<Match> findBySeasonPhaseId(Long seasonPhaseId);

    @Query("""
            SELECT m FROM Match m
            JOIN FETCH m.team t JOIN FETCH t.club
            JOIN FETCH m.season
            LEFT JOIN FETCH m.seasonPhase
            LEFT JOIN FETCH m.competition
            ORDER BY m.matchDateTime DESC
            """)
    List<Match> findAllByOrderByMatchDateTimeDesc();

    @Query("""
            SELECT m FROM Match m
            JOIN FETCH m.team t JOIN FETCH t.club
            JOIN FETCH m.season
            LEFT JOIN FETCH m.seasonPhase
            LEFT JOIN FETCH m.competition
            WHERE t.club.id = :clubId
            ORDER BY m.matchDateTime DESC
            """)
    List<Match> findByTeamClubId(@Param("clubId") Long clubId);

    @Query("""
            SELECT m FROM Match m
            JOIN FETCH m.team t JOIN FETCH t.club
            JOIN FETCH m.season
            LEFT JOIN FETCH m.seasonPhase
            LEFT JOIN FETCH m.competition
            WHERE t.id IN (SELECT cta.team.id FROM CoachTeamAssignment cta WHERE cta.coachUser.id = :coachId)
            ORDER BY m.matchDateTime DESC
            """)
    List<Match> findByAssignedCoachId(@Param("coachId") Long coachId);

    @Query("""
            SELECT DISTINCT m FROM Match m
            JOIN FETCH m.team t JOIN FETCH t.club
            JOIN FETCH m.season
            LEFT JOIN FETCH m.seasonPhase
            LEFT JOIN FETCH m.competition
            WHERE t.id IN (
                SELECT DISTINCT pta.team.id FROM ParentPlayerRelationship ppr JOIN ppr.player p JOIN p.teamAssignments pta
                WHERE ppr.parentUser.id = :parentId AND pta.active = true)
            ORDER BY m.matchDateTime DESC
            """)
    List<Match> findByParentId(@Param("parentId") Long parentId);
}
