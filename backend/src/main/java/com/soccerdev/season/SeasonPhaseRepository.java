package com.soccerdev.season;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeasonPhaseRepository extends JpaRepository<SeasonPhase, Long> {

    List<SeasonPhase> findBySeasonIdOrderByStartDateAsc(Long seasonId);
}
