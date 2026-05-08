package com.soccerdev.stats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerMatchStatsRepository extends JpaRepository<PlayerMatchStats, Long> {

    List<PlayerMatchStats> findByMatchId(Long matchId);

    List<PlayerMatchStats> findByPlayerId(Long playerId);

    Optional<PlayerMatchStats> findByMatchIdAndPlayerId(Long matchId, Long playerId);
}
