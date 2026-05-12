package com.soccerdev.competition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    List<Competition> findByType(CompetitionType type);

    @Query("SELECT c FROM Competition c WHERE c.states IS NULL OR c.states LIKE %:state% ORDER BY c.type, c.name")
    List<Competition> findByState(@Param("state") String state);

    @Query("SELECT c FROM Competition c ORDER BY c.type, c.name")
    List<Competition> findAllOrdered();
}
