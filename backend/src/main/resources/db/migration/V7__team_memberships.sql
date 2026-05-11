-- V7: Replace user_team_memberships with team_memberships (adds role column)

CREATE TABLE team_memberships (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id),
    team_id    BIGINT      NOT NULL REFERENCES teams (id),
    role       VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tm_user_team UNIQUE (user_id, team_id)
);

CREATE INDEX idx_tm_user_id ON team_memberships (user_id);
CREATE INDEX idx_tm_team_id ON team_memberships (team_id);

-- Migrate existing PARENT memberships
INSERT INTO team_memberships (user_id, team_id, role, created_at)
SELECT user_id, team_id, 'PARENT', NOW()
FROM user_team_memberships;

DROP TABLE user_team_memberships;
