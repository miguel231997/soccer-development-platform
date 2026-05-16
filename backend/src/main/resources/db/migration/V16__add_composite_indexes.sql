-- Composite index for the frequent existsByPlayerIdAndTeamIdAndActiveTrue query
-- (player_id alone exists; adding the composite avoids a heap fetch for active check)
CREATE INDEX IF NOT EXISTS idx_pta_player_team_active
    ON player_team_assignments (player_id, team_id, active);

-- Composite index for findByTeamIdAndSeasonId used in match listing and filtering
CREATE INDEX IF NOT EXISTS idx_matches_team_season
    ON matches (team_id, season_id);

-- Composite index for player_registration_requests status queries by team
CREATE INDEX IF NOT EXISTS idx_prr_existing_player_team_status
    ON player_registration_requests (existing_player_id, team_id, status)
    WHERE existing_player_id IS NOT NULL;

-- Composite index for evaluation lookups by match + player (covers the unique constraint path)
CREATE INDEX IF NOT EXISTS idx_pme_match_player
    ON player_match_evaluations (match_id, player_id);
