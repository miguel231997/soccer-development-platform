package com.soccerdev.report;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class ParentDevelopmentReportDto implements ReportView {

    private Long id;
    private Long playerId;
    private String playerName;
    private Long seasonId;
    private String seasonName;
    private String title;
    private String strengths;
    private String areasToImprove;
    private String trainingFocus;
    private String parentSummary;
    private boolean approvedForParent;
    private Instant createdAt;
    private Instant updatedAt;
}
