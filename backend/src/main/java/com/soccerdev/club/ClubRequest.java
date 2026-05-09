package com.soccerdev.club;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubRequest {

    @NotBlank
    private String name;

    private String city;

    private String state;
}
