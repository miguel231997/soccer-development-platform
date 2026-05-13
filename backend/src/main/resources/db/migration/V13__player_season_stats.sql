CREATE TABLE player_season_stats (
    id             BIGSERIAL PRIMARY KEY,
    player_id      BIGINT NOT NULL REFERENCES players(id),
    team_id        BIGINT NOT NULL REFERENCES teams(id),
    season_id      BIGINT REFERENCES seasons(id),
    -- Shooting
    goals              INT NOT NULL DEFAULT 0,
    shots              INT NOT NULL DEFAULT 0,
    shots_on_target    INT NOT NULL DEFAULT 0,
    -- Passing
    assists            INT NOT NULL DEFAULT 0,
    successful_passes  INT NOT NULL DEFAULT 0,
    accurate_long_balls INT NOT NULL DEFAULT 0,
    chances_created    INT NOT NULL DEFAULT 0,
    successful_crosses INT NOT NULL DEFAULT 0,
    -- Possession
    successful_dribbles INT NOT NULL DEFAULT 0,
    duels_won           INT NOT NULL DEFAULT 0,
    dispossessed        INT NOT NULL DEFAULT 0,
    fouls_won           INT NOT NULL DEFAULT 0,
    -- Defending
    tackles             INT NOT NULL DEFAULT 0,
    interceptions       INT NOT NULL DEFAULT 0,
    fouls_committed     INT NOT NULL DEFAULT 0,
    blocked_shots       INT NOT NULL DEFAULT 0,
    clearances          INT NOT NULL DEFAULT 0,
    goals_conceded      INT NOT NULL DEFAULT 0,
    -- Discipline
    yellow_cards        INT NOT NULL DEFAULT 0,
    red_cards           INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pss_player_team_season UNIQUE (player_id, team_id, season_id)
);

CREATE INDEX idx_pss_player_id   ON player_season_stats(player_id);
CREATE INDEX idx_pss_team_season ON player_season_stats(team_id, season_id);
