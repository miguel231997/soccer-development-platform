package com.soccerdev.player;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParentPlayerRelationshipRepository extends JpaRepository<ParentPlayerRelationship, Long> {

    List<ParentPlayerRelationship> findByParentUserId(Long parentUserId);

    List<ParentPlayerRelationship> findByPlayerId(Long playerId);

    Optional<ParentPlayerRelationship> findByParentUserIdAndPlayerId(Long parentUserId, Long playerId);

    boolean existsByParentUserIdAndPlayerId(Long parentUserId, Long playerId);
}
