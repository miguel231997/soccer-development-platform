package com.soccerdev.season;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class SeasonResponse {

    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
}
