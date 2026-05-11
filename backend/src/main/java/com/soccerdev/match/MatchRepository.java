package com.soccerdev.match;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByTeamIdOrderByMatchDateTimeDesc(Long teamId);

    List<Match> findByTeamIdAndSeasonId(Long teamId, Long seasonId);

    List<Match> findByTeamIdAndSeasonIdAndFinalized(Long teamId, Long seasonId, boolean finalized);

    List<Match> findBySeasonPhaseId(Long seasonPhaseId);

    List<Match> findAllByOrderByMatchDateTimeDesc();

    @Query("SELECT m FROM Match m WHERE m.team.club.id = :clubId ORDER BY m.matchDateTime DESC")
    List<Match> findByTeamClubId(@Param("clubId") Long clubId);

    @Query("SELECT m FROM Match m WHERE m.team.id IN " +
           "(SELECT cta.team.id FROM CoachTeamAssignment cta WHERE cta.coachUser.id = :coachId) " +
           "ORDER BY m.matchDateTime DESC")
    List<Match> findByAssignedCoachId(@Param("coachId") Long coachId);

    @Query("SELECT DISTINCT m FROM Match m WHERE m.team.id IN " +
           "(SELECT DISTINCT p.team.id FROM ParentPlayerRelationship ppr JOIN ppr.player p " +
           "WHERE ppr.parentUser.id = :parentId AND p.team IS NOT NULL) " +
           "ORDER BY m.matchDateTime DESC")
    List<Match> findByParentId(@Param("parentId") Long parentId);
}
