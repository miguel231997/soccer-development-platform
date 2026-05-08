-- V2: Core domain schema

-- ─────────────────────────────────────────
-- users
-- ─────────────────────────────────────────
CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(50)  NOT NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- ─────────────────────────────────────────
-- clubs
-- ─────────────────────────────────────────
CREATE TABLE clubs (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    city       VARCHAR(100),
    state      VARCHAR(100),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- teams
-- ─────────────────────────────────────────
CREATE TABLE teams (
    id                BIGSERIAL   PRIMARY KEY,
    club_id           BIGINT      NOT NULL REFERENCES clubs (id),
    name              VARCHAR(255) NOT NULL,
    age_group         VARCHAR(20) NOT NULL,
    gender            VARCHAR(20) NOT NULL,
    competitive_level VARCHAR(30) NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teams_club_id ON teams (club_id);

-- ─────────────────────────────────────────
-- players
-- ─────────────────────────────────────────
CREATE TABLE players (
    id                    BIGSERIAL    PRIMARY KEY,
    team_id               BIGINT       REFERENCES teams (id),
    first_name            VARCHAR(100) NOT NULL,
    last_name             VARCHAR(100) NOT NULL,
    date_of_birth         DATE         NOT NULL,
    primary_position      VARCHAR(10)  NOT NULL,
    secondary_position    VARCHAR(10),
    strong_foot           VARCHAR(10),
    jersey_number         SMALLINT     CHECK (jersey_number BETWEEN 1 AND 99),
    public_profile_enabled BOOLEAN     NOT NULL DEFAULT FALSE,
    profile_image_url     VARCHAR(500),
    active                BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_team_id ON players (team_id);
CREATE INDEX idx_players_active  ON players (active);

-- ─────────────────────────────────────────
-- parent_player_relationships
-- ─────────────────────────────────────────
CREATE TABLE parent_player_relationships (
    id                BIGSERIAL   PRIMARY KEY,
    parent_user_id    BIGINT      NOT NULL REFERENCES users (id),
    player_id         BIGINT      NOT NULL REFERENCES players (id),
    relationship_type VARCHAR(30) NOT NULL,
    CONSTRAINT uq_ppr_parent_player UNIQUE (parent_user_id, player_id)
);

CREATE INDEX idx_ppr_parent_user_id ON parent_player_relationships (parent_user_id);
CREATE INDEX idx_ppr_player_id      ON parent_player_relationships (player_id);

-- ─────────────────────────────────────────
-- coach_team_assignments
-- ─────────────────────────────────────────
CREATE TABLE coach_team_assignments (
    id            BIGSERIAL PRIMARY KEY,
    coach_user_id BIGINT    NOT NULL REFERENCES users (id),
    team_id       BIGINT    NOT NULL REFERENCES teams (id),
    CONSTRAINT uq_cta_coach_team UNIQUE (coach_user_id, team_id)
);

CREATE INDEX idx_cta_coach_user_id ON coach_team_assignments (coach_user_id);
CREATE INDEX idx_cta_team_id       ON coach_team_assignments (team_id);

-- ─────────────────────────────────────────
-- seasons
-- ─────────────────────────────────────────
CREATE TABLE seasons (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    active     BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_season_dates CHECK (end_date >= start_date)
);

-- ─────────────────────────────────────────
-- season_phases
-- ─────────────────────────────────────────
CREATE TABLE season_phases (
    id         BIGSERIAL    PRIMARY KEY,
    season_id  BIGINT       NOT NULL REFERENCES seasons (id),
    name       VARCHAR(100) NOT NULL,
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    CONSTRAINT chk_phase_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_season_phases_season_id ON season_phases (season_id);

-- ─────────────────────────────────────────
-- competitions
-- ─────────────────────────────────────────
CREATE TABLE competitions (
    id   BIGSERIAL    PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(30)  NOT NULL
);

-- ─────────────────────────────────────────
-- matches
-- ─────────────────────────────────────────
CREATE TABLE matches (
    id              BIGSERIAL    PRIMARY KEY,
    team_id         BIGINT       NOT NULL REFERENCES teams (id),
    season_id       BIGINT       NOT NULL REFERENCES seasons (id),
    season_phase_id BIGINT       REFERENCES season_phases (id),
    competition_id  BIGINT       REFERENCES competitions (id),
    opponent        VARCHAR(255) NOT NULL,
    match_date_time TIMESTAMPTZ  NOT NULL,
    location        VARCHAR(255),
    home_away       VARCHAR(10)  NOT NULL,
    home_score      SMALLINT     CHECK (home_score >= 0),
    away_score      SMALLINT     CHECK (away_score >= 0),
    finalized       BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_matches_team_id        ON matches (team_id);
CREATE INDEX idx_matches_season_id      ON matches (season_id);
CREATE INDEX idx_matches_match_date_time ON matches (match_date_time);

-- ─────────────────────────────────────────
-- player_match_stats
-- ─────────────────────────────────────────
CREATE TABLE player_match_stats (
    id               BIGSERIAL     PRIMARY KEY,
    match_id         BIGINT        NOT NULL REFERENCES matches (id),
    player_id        BIGINT        NOT NULL REFERENCES players (id),
    minutes_played   SMALLINT      CHECK (minutes_played >= 0),
    goals            SMALLINT      NOT NULL DEFAULT 0 CHECK (goals >= 0),
    assists          SMALLINT      NOT NULL DEFAULT 0 CHECK (assists >= 0),
    shots            SMALLINT      NOT NULL DEFAULT 0 CHECK (shots >= 0),
    shots_on_target  SMALLINT      NOT NULL DEFAULT 0 CHECK (shots_on_target >= 0),
    saves            SMALLINT      NOT NULL DEFAULT 0 CHECK (saves >= 0),
    clean_sheet      BOOLEAN       NOT NULL DEFAULT FALSE,
    xg               NUMERIC(5, 2) CHECK (xg >= 0),
    xa               NUMERIC(5, 2) CHECK (xa >= 0),
    xt               NUMERIC(5, 2),
    danger_prevented NUMERIC(5, 2),
    CONSTRAINT uq_pms_match_player UNIQUE (match_id, player_id)
);

CREATE INDEX idx_pms_match_id  ON player_match_stats (match_id);
CREATE INDEX idx_pms_player_id ON player_match_stats (player_id);

-- ─────────────────────────────────────────
-- player_match_evaluations
-- ─────────────────────────────────────────
CREATE TABLE player_match_evaluations (
    id                    BIGSERIAL   PRIMARY KEY,
    match_id              BIGINT      NOT NULL REFERENCES matches (id),
    player_id             BIGINT      NOT NULL REFERENCES players (id),
    coach_user_id         BIGINT      NOT NULL REFERENCES users (id),
    position_played       VARCHAR(10),
    technical_rating      SMALLINT    CHECK (technical_rating      BETWEEN 1 AND 10),
    tactical_rating       SMALLINT    CHECK (tactical_rating       BETWEEN 1 AND 10),
    physical_rating       SMALLINT    CHECK (physical_rating       BETWEEN 1 AND 10),
    mentality_rating      SMALLINT    CHECK (mentality_rating      BETWEEN 1 AND 10),
    attacking_rating      SMALLINT    CHECK (attacking_rating      BETWEEN 1 AND 10),
    defending_rating      SMALLINT    CHECK (defending_rating      BETWEEN 1 AND 10),
    decision_making_rating SMALLINT   CHECK (decision_making_rating BETWEEN 1 AND 10),
    work_rate_rating      SMALLINT    CHECK (work_rate_rating      BETWEEN 1 AND 10),
    overall_rating        SMALLINT    CHECK (overall_rating        BETWEEN 1 AND 10),
    parent_visible_notes  TEXT,
    coach_only_notes      TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pme_match_player_coach UNIQUE (match_id, player_id, coach_user_id)
);

CREATE INDEX idx_pme_match_id      ON player_match_evaluations (match_id);
CREATE INDEX idx_pme_player_id     ON player_match_evaluations (player_id);
CREATE INDEX idx_pme_coach_user_id ON player_match_evaluations (coach_user_id);

-- ─────────────────────────────────────────
-- development_reports
-- ─────────────────────────────────────────
CREATE TABLE development_reports (
    id                   BIGSERIAL    PRIMARY KEY,
    player_id            BIGINT       NOT NULL REFERENCES players (id),
    season_id            BIGINT       NOT NULL REFERENCES seasons (id),
    generated_by_user_id BIGINT       NOT NULL REFERENCES users (id),
    title                VARCHAR(255) NOT NULL,
    strengths            TEXT,
    areas_to_improve     TEXT,
    training_focus       TEXT,
    parent_summary       TEXT,
    coach_only_analysis  TEXT,
    approved_for_parent  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dr_player_id            ON development_reports (player_id);
CREATE INDEX idx_dr_season_id            ON development_reports (season_id);
CREATE INDEX idx_dr_generated_by_user_id ON development_reports (generated_by_user_id);
