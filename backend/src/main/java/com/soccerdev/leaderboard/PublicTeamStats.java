package com.soccerdev.leaderboard;

import com.soccerdev.team.AgeGroup;
import com.soccerdev.team.CompetitiveLevel;
import com.soccerdev.team.Gender;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PublicTeamStats {

    private Long teamId;
    private String teamName;
    private AgeGroup ageGroup;
    private Gender gender;
    private CompetitiveLevel competitiveLevel;
    private Long clubId;
    private String clubName;
    private List<PlayerLeaderboardEntry> players;
}
