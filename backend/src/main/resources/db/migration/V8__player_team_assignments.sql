-- V8: Introduce PlayerTeamAssignment (multi-team players) and extend TeamMembership

-- ─────────────────────────────────────────
-- Extend team_memberships with active + updated_at
-- ─────────────────────────────────────────
ALTER TABLE team_memberships
    ADD COLUMN active     BOOLEAN      NOT NULL DEFAULT TRUE,
    ADD COLUMN updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW();

-- ─────────────────────────────────────────
-- player_team_assignments
-- Canonical player ↔ team relationship. Replaces players.team_id.
-- ─────────────────────────────────────────
CREATE TABLE player_team_assignments (
    id         BIGSERIAL    PRIMARY KEY,
    player_id  BIGINT       NOT NULL REFERENCES players (id),
    team_id    BIGINT       NOT NULL REFERENCES teams (id),
    season_id  BIGINT       REFERENCES seasons (id),
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    joined_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    left_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pta_player_id ON player_team_assignments (player_id);
CREATE INDEX idx_pta_team_id   ON player_team_assignments (team_id);
CREATE INDEX idx_pta_active    ON player_team_assignments (active);

-- Migrate existing player→team rows
INSERT INTO player_team_assignments (player_id, team_id, active, joined_at, created_at, updated_at)
SELECT id, team_id, TRUE, created_at, created_at, NOW()
FROM players
WHERE team_id IS NOT NULL;

-- Remove team_id from players (PlayerTeamAssignment is now canonical)
ALTER TABLE players DROP COLUMN team_id;
