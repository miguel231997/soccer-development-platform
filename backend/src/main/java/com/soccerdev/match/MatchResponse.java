package com.soccerdev.match;

import com.soccerdev.competition.CompetitionType;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class MatchResponse {

    private Long id;

    private Long teamId;
    private String teamName;

    private Long seasonId;
    private String seasonName;

    private Long seasonPhaseId;
    private String seasonPhaseName;

    private Long competitionId;
    private String competitionName;
    private CompetitionType competitionType;

    private String opponent;
    private Instant matchDateTime;
    private String location;
    private HomeAway homeAway;

    private Integer homeScore;
    private Integer awayScore;

    private boolean finalized;
}
