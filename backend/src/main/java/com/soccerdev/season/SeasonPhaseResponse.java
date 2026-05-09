package com.soccerdev.season;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SeasonPhaseResponse {

    private Long id;
    private Long seasonId;
    private String seasonName;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
}
