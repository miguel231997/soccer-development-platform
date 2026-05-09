package com.soccerdev.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CoachTeamAssignmentRepository extends JpaRepository<CoachTeamAssignment, Long> {

    List<CoachTeamAssignment> findByCoachUserId(Long coachUserId);

    List<CoachTeamAssignment> findByTeamId(Long teamId);

    boolean existsByCoachUserIdAndTeamId(Long coachUserId, Long teamId);

    boolean existsByCoachUserIdAndTeamClubId(Long coachUserId, Long clubId);
}
