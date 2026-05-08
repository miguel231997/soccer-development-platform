-- V3: Align all SMALLINT columns to INTEGER to match Hibernate's mapping of Java Integer/int.
--     Also documents the UserRole rename: CLUB_ADMIN -> DIRECTOR (Java enum only; role
--     is stored as VARCHAR so no data migration is required on a fresh schema).

-- ─────────────────────────────────────────
-- matches: home_score, away_score
-- ─────────────────────────────────────────
ALTER TABLE matches
    ALTER COLUMN home_score TYPE INTEGER USING home_score::INTEGER,
    ALTER COLUMN away_score TYPE INTEGER USING away_score::INTEGER;

-- ─────────────────────────────────────────
-- players: jersey_number
-- ─────────────────────────────────────────
ALTER TABLE players
    ALTER COLUMN jersey_number TYPE INTEGER USING jersey_number::INTEGER;

-- ─────────────────────────────────────────
-- player_match_stats: all numeric stat columns
-- ─────────────────────────────────────────
ALTER TABLE player_match_stats
    ALTER COLUMN minutes_played   TYPE INTEGER USING minutes_played::INTEGER,
    ALTER COLUMN goals            TYPE INTEGER USING goals::INTEGER,
    ALTER COLUMN assists          TYPE INTEGER USING assists::INTEGER,
    ALTER COLUMN shots            TYPE INTEGER USING shots::INTEGER,
    ALTER COLUMN shots_on_target  TYPE INTEGER USING shots_on_target::INTEGER,
    ALTER COLUMN saves            TYPE INTEGER USING saves::INTEGER;

-- ─────────────────────────────────────────
-- player_match_evaluations: all rating columns
-- ─────────────────────────────────────────
ALTER TABLE player_match_evaluations
    ALTER COLUMN technical_rating       TYPE INTEGER USING technical_rating::INTEGER,
    ALTER COLUMN tactical_rating        TYPE INTEGER USING tactical_rating::INTEGER,
    ALTER COLUMN physical_rating        TYPE INTEGER USING physical_rating::INTEGER,
    ALTER COLUMN mentality_rating       TYPE INTEGER USING mentality_rating::INTEGER,
    ALTER COLUMN attacking_rating       TYPE INTEGER USING attacking_rating::INTEGER,
    ALTER COLUMN defending_rating       TYPE INTEGER USING defending_rating::INTEGER,
    ALTER COLUMN decision_making_rating TYPE INTEGER USING decision_making_rating::INTEGER,
    ALTER COLUMN work_rate_rating       TYPE INTEGER USING work_rate_rating::INTEGER,
    ALTER COLUMN overall_rating         TYPE INTEGER USING overall_rating::INTEGER;
