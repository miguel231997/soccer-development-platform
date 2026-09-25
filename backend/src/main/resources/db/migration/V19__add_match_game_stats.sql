ALTER TABLE matches
    ADD COLUMN game_stats_locked      BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN possession_pct         INTEGER,
    ADD COLUMN team_shots             INTEGER,
    ADD COLUMN opponent_shots         INTEGER,
    ADD COLUMN team_completed_passes  INTEGER,
    ADD COLUMN opponent_completed_passes INTEGER,
    ADD COLUMN team_touches           INTEGER;
