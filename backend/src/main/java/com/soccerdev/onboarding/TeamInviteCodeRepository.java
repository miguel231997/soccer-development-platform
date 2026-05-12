package com.soccerdev.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeamInviteCodeRepository extends JpaRepository<TeamInviteCode, Long> {

    @Query("SELECT t FROM TeamInviteCode t JOIN FETCH t.team WHERE t.code = :code")
    Optional<TeamInviteCode> findByCodeWithTeam(String code);

    @Query("SELECT t FROM TeamInviteCode t JOIN FETCH t.team JOIN FETCH t.createdByUser WHERE t.team.id = :teamId AND t.active = true ORDER BY t.createdAt ASC")
    List<TeamInviteCode> findActiveByTeamId(@Param("teamId") Long teamId);

    @Query("SELECT t FROM TeamInviteCode t JOIN FETCH t.team JOIN FETCH t.createdByUser ORDER BY t.createdAt DESC")
    List<TeamInviteCode> findAllWithAssociations();
}
