package com.soccerdev.team;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {

    boolean existsByUserIdAndTeamId(Long userId, Long teamId);

    @Query("SELECT tm FROM TeamMembership tm JOIN FETCH tm.team t JOIN FETCH t.club WHERE tm.user.id = :userId")
    List<TeamMembership> findByUserId(@Param("userId") Long userId);
}
