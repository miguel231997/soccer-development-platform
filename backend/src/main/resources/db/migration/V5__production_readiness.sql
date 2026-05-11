-- V5: Production-readiness hardening

-- ─────────────────────────────────────────
-- Composite index: parent approved-report query is the hottest read path for PAREENTs
-- ─────────────────────────────────────────
CREATE INDEX idx_dr_player_approved ON development_reports (player_id, approved_for_parent);

-- ─────────────────────────────────────────
-- Composite index for common match filter (team + season)
-- ─────────────────────────────────────────
CREATE INDEX idx_matches_team_season ON matches (team_id, season_id);

-- ─────────────────────────────────────────
-- Audit timestamps for matches
-- ─────────────────────────────────────────
ALTER TABLE matches
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─────────────────────────────────────────
-- Audit timestamps for player_match_stats
-- ─────────────────────────────────────────
ALTER TABLE player_match_stats
    ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
