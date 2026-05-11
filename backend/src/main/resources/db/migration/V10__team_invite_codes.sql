-- team_invite_codes: separate from registration_codes (which are for account creation).
-- Parents enter these to link a child to a specific team.
CREATE TABLE team_invite_codes (
    id                  BIGSERIAL    PRIMARY KEY,
    code                VARCHAR(64)  NOT NULL UNIQUE,
    team_id             BIGINT       NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
    active              BOOLEAN      NOT NULL DEFAULT TRUE,
    expires_at          TIMESTAMPTZ,
    max_uses            INTEGER,
    uses_count          INTEGER      NOT NULL DEFAULT 0,
    created_by_user_id  BIGINT       NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_tic_code    ON team_invite_codes(code);
CREATE INDEX idx_tic_team_id ON team_invite_codes(team_id);
CREATE INDEX idx_tic_active  ON team_invite_codes(active);

-- Allows an already-approved player to request joining a second team without duplicating the player record.
ALTER TABLE player_registration_requests
    ADD COLUMN existing_player_id BIGINT REFERENCES players(id);
