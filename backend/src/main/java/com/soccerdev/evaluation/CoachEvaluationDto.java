package com.soccerdev.evaluation;

import com.soccerdev.player.Position;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class CoachEvaluationDto implements EvaluationView {

    private Long id;
    private Long matchId;
    private String opponent;
    private Instant matchDateTime;
    private Long playerId;
    private String playerName;
    private Long coachUserId;
    private String coachName;
    private Position positionPlayed;
    private Integer technicalRating;
    private Integer tacticalRating;
    private Integer physicalRating;
    private Integer mentalityRating;
    private Integer attackingRating;
    private Integer defendingRating;
    private Integer decisionMakingRating;
    private Integer workRateRating;
    private Integer overallRating;
    private String parentVisibleNotes;
    private String coachOnlyNotes;
    private boolean own;
    private Instant createdAt;
    private Instant updatedAt;
}
