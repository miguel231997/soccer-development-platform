package com.soccerdev.club;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByStateIgnoreCase(String state);

    @Query("SELECT DISTINCT t.club FROM CoachTeamAssignment cta JOIN cta.team t WHERE cta.coachUser.id = :coachId")
    List<Club> findByAssignedCoachId(@Param("coachId") Long coachId);

    @Query("SELECT DISTINCT pta.team.club FROM ParentPlayerRelationship ppr JOIN ppr.player p JOIN p.teamAssignments pta WHERE ppr.parentUser.id = :parentId AND pta.active = true")
    List<Club> findByParentId(@Param("parentId") Long parentId);
}
