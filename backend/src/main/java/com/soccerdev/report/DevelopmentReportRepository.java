package com.soccerdev.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DevelopmentReportRepository extends JpaRepository<DevelopmentReport, Long> {

    List<DevelopmentReport> findByPlayerId(Long playerId);

    List<DevelopmentReport> findByPlayerIdAndSeasonId(Long playerId, Long seasonId);

    List<DevelopmentReport> findByPlayerIdAndApprovedForParent(Long playerId, boolean approvedForParent);

    List<DevelopmentReport> findByGeneratedByUserId(Long generatedByUserId);
}
