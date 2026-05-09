package com.soccerdev.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    List<Team> findByClubId(Long clubId);

    List<Team> findByClubIdAndAgeGroup(Long clubId, AgeGroup ageGroup);

    @Query("SELECT t FROM CoachTeamAssignment cta JOIN cta.team t WHERE cta.coachUser.id = :coachId")
    List<Team> findByAssignedCoachId(@Param("coachId") Long coachId);

    @Query("SELECT DISTINCT p.team FROM ParentPlayerRelationship ppr JOIN ppr.player p WHERE ppr.parentUser.id = :parentId AND p.team IS NOT NULL")
    List<Team> findByParentId(@Param("parentId") Long parentId);
}
