package com.soccerdev.report;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportRequest {

    @NotNull
    private Long seasonId;

    @NotBlank
    private String title;

    private String strengths;

    private String areasToImprove;

    private String trainingFocus;

    private String parentSummary;

    private String coachOnlyAnalysis;
}
