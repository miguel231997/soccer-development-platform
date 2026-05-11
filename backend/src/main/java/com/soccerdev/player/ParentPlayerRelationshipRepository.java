package com.soccerdev.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ParentPlayerRelationshipRepository extends JpaRepository<ParentPlayerRelationship, Long> {

    List<ParentPlayerRelationship> findByParentUserId(Long parentUserId);

    List<ParentPlayerRelationship> findByPlayerId(Long playerId);

    Optional<ParentPlayerRelationship> findByParentUserIdAndPlayerId(Long parentUserId, Long playerId);

    boolean existsByParentUserIdAndPlayerId(Long parentUserId, Long playerId);

    @Query("SELECT ppr.player.id FROM ParentPlayerRelationship ppr WHERE ppr.parentUser.id = :parentUserId")
    Set<Long> findPlayerIdsByParentUserId(@Param("parentUserId") Long parentUserId);
}
