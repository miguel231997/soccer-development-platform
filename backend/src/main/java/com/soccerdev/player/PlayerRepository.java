package com.soccerdev.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    List<Player> findByTeamId(Long teamId);

    List<Player> findByTeamIdAndActive(Long teamId, boolean active);

    List<Player> findByTeamIdIsNull();

    List<Player> findByTeamClubId(Long clubId);

    @Query("SELECT p FROM Player p WHERE p.team.id IN (SELECT cta.team.id FROM CoachTeamAssignment cta WHERE cta.coachUser.id = :coachId)")
    List<Player> findByAssignedCoachId(@Param("coachId") Long coachId);

    @Query("SELECT ppr.player FROM ParentPlayerRelationship ppr WHERE ppr.parentUser.id = :parentId")
    List<Player> findByParentId(@Param("parentId") Long parentId);
}
