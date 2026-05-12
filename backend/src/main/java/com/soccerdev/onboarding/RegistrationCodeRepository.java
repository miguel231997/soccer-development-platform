package com.soccerdev.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationCodeRepository extends JpaRepository<RegistrationCode, Long> {

    @Query("SELECT rc FROM RegistrationCode rc JOIN FETCH rc.team JOIN FETCH rc.createdByUser WHERE rc.code = :code")
    Optional<RegistrationCode> findByCode(@Param("code") String code);

    boolean existsByCode(String code);

    @Query("""
            SELECT rc FROM RegistrationCode rc
            JOIN FETCH rc.team t
            JOIN FETCH rc.createdByUser
            WHERE rc.team.id = :teamId AND rc.role = :role AND rc.active = true
            """)
    Optional<RegistrationCode> findActiveByTeamIdAndRole(
            @Param("teamId") Long teamId,
            @Param("role") com.soccerdev.user.UserRole role);

    @Query("""
            SELECT rc FROM RegistrationCode rc
            JOIN FETCH rc.team t
            JOIN FETCH rc.createdByUser
            ORDER BY rc.createdAt DESC
            """)
    List<RegistrationCode> findAllWithAssociations();
}
