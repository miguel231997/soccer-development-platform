-- Composite index for team-centric player assignment queries
-- Covers existsByPlayerIdInAndTeamIdAndActiveTrue and findByTeamId-style lookups where team_id is the leading filter
CREATE INDEX IF NOT EXISTS idx_pta_team_player_active
    ON player_team_assignments (team_id, player_id, active);

-- Composite index for parent registration request queries (listMine)
-- Covers findByParentUserId grouped by status without a full table scan
CREATE INDEX IF NOT EXISTS idx_prr_parent_status
    ON player_registration_requests (parent_user_id, status);

-- Index for match finalized-state queries
-- Covers the isFinalized() check in stats upsert and match update guard
CREATE INDEX IF NOT EXISTS idx_matches_team_finalized
    ON matches (team_id, finalized);
