package com.soccerdev.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {

    boolean existsByUserIdAndTeamId(Long userId, Long teamId);
}
