package com.soccerdev.match;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByTeamId(Long teamId);

    List<Match> findByTeamIdAndSeasonId(Long teamId, Long seasonId);

    List<Match> findByTeamIdAndSeasonIdAndFinalized(Long teamId, Long seasonId, boolean finalized);

    List<Match> findBySeasonPhaseId(Long seasonPhaseId);
}
