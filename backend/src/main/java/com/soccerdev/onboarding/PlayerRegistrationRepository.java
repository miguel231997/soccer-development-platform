package com.soccerdev.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRegistrationRepository extends JpaRepository<PlayerRegistrationRequest, Long> {

    @Query("""
            SELECT r FROM PlayerRegistrationRequest r
            JOIN FETCH r.parentUser
            JOIN FETCH r.team t
            JOIN FETCH t.club
            WHERE r.parentUser.id = :parentUserId
            ORDER BY r.createdAt DESC
            """)
    List<PlayerRegistrationRequest> findByParentUserId(@Param("parentUserId") Long parentUserId);

    @Query("""
            SELECT r FROM PlayerRegistrationRequest r
            JOIN FETCH r.parentUser
            JOIN FETCH r.team t
            JOIN FETCH t.club
            LEFT JOIN FETCH r.reviewedByUser
            ORDER BY r.createdAt DESC
            """)
    List<PlayerRegistrationRequest> findAllWithAssociations();

    @Query("""
            SELECT r FROM PlayerRegistrationRequest r
            JOIN FETCH r.parentUser
            JOIN FETCH r.team t
            JOIN FETCH t.club
            LEFT JOIN FETCH r.reviewedByUser
            WHERE t.club.id = :clubId
            ORDER BY r.createdAt DESC
            """)
    List<PlayerRegistrationRequest> findByTeamClubIdWithAssociations(@Param("clubId") Long clubId);

    @Query("""
            SELECT r FROM PlayerRegistrationRequest r
            JOIN FETCH r.parentUser
            JOIN FETCH r.team t
            JOIN FETCH t.club
            LEFT JOIN FETCH r.reviewedByUser
            WHERE r.team.id IN :teamIds
            ORDER BY r.createdAt DESC
            """)
    List<PlayerRegistrationRequest> findByTeamIdInWithAssociations(@Param("teamIds") List<Long> teamIds);

    @Query("""
            SELECT r FROM PlayerRegistrationRequest r
            JOIN FETCH r.parentUser
            JOIN FETCH r.team t
            JOIN FETCH t.club
            LEFT JOIN FETCH r.reviewedByUser
            WHERE r.id = :id
            """)
    Optional<PlayerRegistrationRequest> findByIdWithAssociations(@Param("id") Long id);

    boolean existsByExistingPlayerIdAndTeamIdAndStatus(Long existingPlayerId, Long teamId, RegistrationStatus status);
}
