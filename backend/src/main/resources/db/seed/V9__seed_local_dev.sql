-- V9: Local development seed data
-- Loaded ONLY when spring.flyway.locations includes classpath:db/seed (i.e. --spring.profiles.active=local)
-- DO NOT INCLUDE db/seed IN PRODUCTION FLYWAY LOCATIONS
-- Idempotent: uses WHERE NOT EXISTS / ON CONFLICT to handle pre-existing test data

BEGIN;

-- ─────────────────────────────────────────
-- Club
-- ─────────────────────────────────────────
INSERT INTO clubs (name, city, state)
SELECT 'Silver Lake Soccer Academy', 'Silver Lake', 'CA'
WHERE NOT EXISTS (SELECT 1 FROM clubs WHERE name = 'Silver Lake Soccer Academy');

-- ─────────────────────────────────────────
-- Season  (may already exist from earlier test data)
-- ─────────────────────────────────────────
INSERT INTO seasons (name, start_date, end_date, active)
SELECT '2025-2026', '2025-08-01', '2026-07-31', true
WHERE NOT EXISTS (SELECT 1 FROM seasons WHERE name = '2025-2026');

-- ─────────────────────────────────────────
-- Season phases
-- ─────────────────────────────────────────
INSERT INTO season_phases (season_id, name, start_date, end_date)
SELECT s.id, 'Fall 2025', '2025-08-01', '2025-12-31'
FROM seasons s
WHERE s.name = '2025-2026'
  AND NOT EXISTS (SELECT 1 FROM season_phases sp WHERE sp.season_id = s.id AND sp.name = 'Fall 2025');

INSERT INTO season_phases (season_id, name, start_date, end_date)
SELECT s.id, 'Spring 2026', '2026-01-01', '2026-07-31'
FROM seasons s
WHERE s.name = '2025-2026'
  AND NOT EXISTS (SELECT 1 FROM season_phases sp WHERE sp.season_id = s.id AND sp.name = 'Spring 2026');

-- ─────────────────────────────────────────
-- Competition  (EDP may already exist)
-- ─────────────────────────────────────────
INSERT INTO competitions (name, type)
SELECT 'EDP', 'LEAGUE'
WHERE NOT EXISTS (SELECT 1 FROM competitions WHERE name = 'EDP');

-- ─────────────────────────────────────────
-- Team
-- ─────────────────────────────────────────
INSERT INTO teams (club_id, name, age_group, gender, competitive_level)
SELECT c.id, '2015 Boys Orange', 'U10', 'MALE', 'COMPETITIVE'
FROM clubs c
WHERE c.name = 'Silver Lake Soccer Academy'
  AND NOT EXISTS (SELECT 1 FROM teams WHERE name = '2015 Boys Orange');

-- ─────────────────────────────────────────
-- Users  (pgcrypto gen_salt('bf',10) produces $2a$10$... — compatible with Spring BCryptPasswordEncoder)
-- Passwords: admin→Admin1234!   coach→Coach1234!   parent→Parent1234!
-- ─────────────────────────────────────────
INSERT INTO users (email, password_hash, first_name, last_name, role, enabled)
SELECT 'admin@silverlake.test', crypt('Admin1234!', gen_salt('bf', 10)), 'System', 'Admin', 'ADMIN', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@silverlake.test');

INSERT INTO users (email, password_hash, first_name, last_name, role, enabled)
SELECT 'coach@silverlake.test', crypt('Coach1234!', gen_salt('bf', 10)), 'Marcus', 'Rivera', 'COACH', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'coach@silverlake.test');

INSERT INTO users (email, password_hash, first_name, last_name, role, enabled)
SELECT 'parent@silverlake.test', crypt('Parent1234!', gen_salt('bf', 10)), 'Jennifer', 'Torres', 'PARENT', true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'parent@silverlake.test');

-- ─────────────────────────────────────────
-- Coach team assignment
-- ─────────────────────────────────────────
INSERT INTO coach_team_assignments (coach_user_id, team_id)
SELECT u.id, t.id
FROM users u, teams t
WHERE u.email = 'coach@silverlake.test'
  AND t.name  = '2015 Boys Orange'
  AND NOT EXISTS (
    SELECT 1 FROM coach_team_assignments cta
    WHERE cta.coach_user_id = u.id AND cta.team_id = t.id
  );

-- ─────────────────────────────────────────
-- Team memberships (so canViewTeam works for parent and coach)
-- ─────────────────────────────────────────
INSERT INTO team_memberships (user_id, team_id, role)
SELECT u.id, t.id, 'COACH'
FROM users u, teams t
WHERE u.email = 'coach@silverlake.test'
  AND t.name  = '2015 Boys Orange'
  AND NOT EXISTS (
    SELECT 1 FROM team_memberships tm
    WHERE tm.user_id = u.id AND tm.team_id = t.id AND tm.role = 'COACH'
  );

INSERT INTO team_memberships (user_id, team_id, role)
SELECT u.id, t.id, 'PARENT'
FROM users u, teams t
WHERE u.email = 'parent@silverlake.test'
  AND t.name  = '2015 Boys Orange'
  AND NOT EXISTS (
    SELECT 1 FROM team_memberships tm
    WHERE tm.user_id = u.id AND tm.team_id = t.id AND tm.role = 'PARENT'
  );

-- ─────────────────────────────────────────
-- Registration codes (for testing self-service registration)
-- ─────────────────────────────────────────
INSERT INTO registration_codes (code, team_id, role, active, max_uses, created_by_user_id)
SELECT 'SLSA-COACH-2025', t.id, 'COACH', true, 10, u.id
FROM teams t, users u
WHERE t.name  = '2015 Boys Orange'
  AND u.email = 'admin@silverlake.test'
  AND NOT EXISTS (SELECT 1 FROM registration_codes WHERE code = 'SLSA-COACH-2025');

INSERT INTO registration_codes (code, team_id, role, active, max_uses, created_by_user_id)
SELECT 'SLSA-PARENT-2025', t.id, 'PARENT', true, 20, u.id
FROM teams t, users u
WHERE t.name  = '2015 Boys Orange'
  AND u.email = 'admin@silverlake.test'
  AND NOT EXISTS (SELECT 1 FROM registration_codes WHERE code = 'SLSA-PARENT-2025');

-- ─────────────────────────────────────────
-- Players  (5 fictional — birth year 2015 to match team)
-- players 1-3: public_profile_enabled=true  (appear on public leaderboard)
-- players 4-5: public_profile_enabled=false (hidden from leaderboard)
-- ─────────────────────────────────────────
INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Carlos', 'Mendez', '2015-04-12', 'ST', 'CF', 'RIGHT', 9, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Diego', 'Alvarez', '2015-06-23', 'CM', 'CAM', 'RIGHT', 8, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Diego' AND last_name = 'Alvarez');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Ethan', 'Brooks', '2015-02-18', 'LW', 'RW', 'LEFT', 11, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Ethan' AND last_name = 'Brooks');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Noah', 'Kim', '2015-09-05', 'CB', 'CDM', 'RIGHT', 5, false, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Noah' AND last_name = 'Kim');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Liam', 'Chen', '2015-11-30', 'GK', NULL, 'RIGHT', 1, false, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Liam' AND last_name = 'Chen');

-- ─────────────────────────────────────────
-- Player → team assignments
-- ─────────────────────────────────────────
INSERT INTO player_team_assignments (player_id, team_id, season_id, active)
SELECT
  p.id,
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'  LIMIT 1),
  (SELECT id FROM seasons WHERE name = '2025-2026'         LIMIT 1),
  true
FROM players p
WHERE p.last_name IN ('Mendez', 'Alvarez', 'Brooks', 'Kim', 'Chen')
  AND NOT EXISTS (
    SELECT 1 FROM player_team_assignments pta
    WHERE pta.player_id  = p.id
      AND pta.team_id    = (SELECT id FROM teams   WHERE name = '2015 Boys Orange' LIMIT 1)
      AND pta.season_id  = (SELECT id FROM seasons WHERE name = '2025-2026'        LIMIT 1)
  );

-- ─────────────────────────────────────────
-- Parent → child relationship  (parent@silverlake.test linked to Carlos Mendez only)
-- ─────────────────────────────────────────
INSERT INTO parent_player_relationships (parent_user_id, player_id, relationship_type)
SELECT u.id, p.id, 'PARENT'
FROM users u, players p
WHERE u.email      = 'parent@silverlake.test'
  AND p.first_name = 'Carlos'
  AND p.last_name  = 'Mendez'
  AND NOT EXISTS (
    SELECT 1 FROM parent_player_relationships ppr
    WHERE ppr.parent_user_id = u.id AND ppr.player_id = p.id
  );

-- ─────────────────────────────────────────
-- Matches
-- Match 1: past, finalized (3 weeks ago)
-- Match 2: upcoming (2 weeks from now)
-- ─────────────────────────────────────────
INSERT INTO matches (team_id, season_id, season_phase_id, competition_id,
                     opponent, match_date_time, location, home_away,
                     home_score, away_score, finalized)
SELECT
  (SELECT id FROM teams         WHERE name = '2015 Boys Orange'  LIMIT 1),
  (SELECT id FROM seasons       WHERE name = '2025-2026'         LIMIT 1),
  (SELECT id FROM season_phases WHERE name = 'Fall 2025'         LIMIT 1),
  (SELECT id FROM competitions  WHERE name = 'EDP'               LIMIT 1),
  'FC Oakland',
  NOW() - INTERVAL '3 weeks',
  'Silver Lake Sports Complex – Field 2',
  'HOME',
  3, 1,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM matches m
  JOIN teams t ON m.team_id = t.id
  WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange'
);

INSERT INTO matches (team_id, season_id, season_phase_id, competition_id,
                     opponent, match_date_time, location, home_away,
                     home_score, away_score, finalized)
SELECT
  (SELECT id FROM teams         WHERE name = '2015 Boys Orange'  LIMIT 1),
  (SELECT id FROM seasons       WHERE name = '2025-2026'         LIMIT 1),
  (SELECT id FROM season_phases WHERE name = 'Spring 2026'       LIMIT 1),
  (SELECT id FROM competitions  WHERE name = 'EDP'               LIMIT 1),
  'Bay United FC',
  NOW() + INTERVAL '2 weeks',
  'Bay United Training Ground – Pitch A',
  'AWAY',
  NULL, NULL,
  false
WHERE NOT EXISTS (
  SELECT 1 FROM matches m
  JOIN teams t ON m.team_id = t.id
  WHERE m.opponent = 'Bay United FC' AND t.name = '2015 Boys Orange'
);

-- ─────────────────────────────────────────
-- Match stats (match 1 / vs FC Oakland only — finalized match)
-- ─────────────────────────────────────────

-- Carlos Mendez: 2G 1A — star performance
INSERT INTO player_match_stats
  (match_id, player_id, minutes_played, goals, assists, shots, shots_on_target,
   saves, clean_sheet, xg, xa, xt, danger_prevented)
SELECT
  (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1),
  (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez'),
  90, 2, 1, 5, 4, 0, false, 1.82, 0.45, 0.38, 0.00
WHERE NOT EXISTS (
  SELECT 1 FROM player_match_stats pms
  WHERE pms.match_id  = (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1)
    AND pms.player_id = (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez')
);

-- Diego Alvarez: 1G 0A
INSERT INTO player_match_stats
  (match_id, player_id, minutes_played, goals, assists, shots, shots_on_target,
   saves, clean_sheet, xg, xa, xt, danger_prevented)
SELECT
  (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1),
  (SELECT id FROM players WHERE first_name = 'Diego' AND last_name = 'Alvarez'),
  90, 1, 0, 3, 2, 0, false, 0.75, 0.12, 0.22, 0.00
WHERE NOT EXISTS (
  SELECT 1 FROM player_match_stats pms
  WHERE pms.match_id  = (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1)
    AND pms.player_id = (SELECT id FROM players WHERE first_name = 'Diego' AND last_name = 'Alvarez')
);

-- Ethan Brooks: 0G 2A — creative midfielder
INSERT INTO player_match_stats
  (match_id, player_id, minutes_played, goals, assists, shots, shots_on_target,
   saves, clean_sheet, xg, xa, xt, danger_prevented)
SELECT
  (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1),
  (SELECT id FROM players WHERE first_name = 'Ethan' AND last_name = 'Brooks'),
  90, 0, 2, 1, 0, 0, false, 0.08, 0.72, 0.31, 0.00
WHERE NOT EXISTS (
  SELECT 1 FROM player_match_stats pms
  WHERE pms.match_id  = (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1)
    AND pms.player_id = (SELECT id FROM players WHERE first_name = 'Ethan' AND last_name = 'Brooks')
);

-- Noah Kim: 70 min (subbed off)
INSERT INTO player_match_stats
  (match_id, player_id, minutes_played, goals, assists, shots, shots_on_target,
   saves, clean_sheet, xg, xa, xt, danger_prevented)
SELECT
  (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1),
  (SELECT id FROM players WHERE first_name = 'Noah' AND last_name = 'Kim'),
  70, 0, 0, 1, 0, 0, false, 0.04, 0.00, 0.15, 0.42
WHERE NOT EXISTS (
  SELECT 1 FROM player_match_stats pms
  WHERE pms.match_id  = (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1)
    AND pms.player_id = (SELECT id FROM players WHERE first_name = 'Noah' AND last_name = 'Kim')
);

-- Liam Chen (GK): 90 min, 3 saves, conceded 1 goal (not a clean sheet)
INSERT INTO player_match_stats
  (match_id, player_id, minutes_played, goals, assists, shots, shots_on_target,
   saves, clean_sheet, xg, xa, xt, danger_prevented)
SELECT
  (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1),
  (SELECT id FROM players WHERE first_name = 'Liam' AND last_name = 'Chen'),
  90, 0, 0, 0, 0, 3, false, 0.00, 0.00, 0.00, 1.84
WHERE NOT EXISTS (
  SELECT 1 FROM player_match_stats pms
  WHERE pms.match_id  = (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1)
    AND pms.player_id = (SELECT id FROM players WHERE first_name = 'Liam' AND last_name = 'Chen')
);

-- ─────────────────────────────────────────
-- Evaluation (match 1, Carlos Mendez, by coach)
-- parent_visible_notes: shared with parent
-- coach_only_notes:     NEVER sent to parent (server strips it from ParentEvaluationDto)
-- ─────────────────────────────────────────
INSERT INTO player_match_evaluations
  (match_id, player_id, coach_user_id, position_played,
   technical_rating, tactical_rating, physical_rating, mentality_rating,
   attacking_rating, defending_rating, decision_making_rating, work_rate_rating, overall_rating,
   parent_visible_notes, coach_only_notes)
SELECT
  (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1),
  (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez'),
  (SELECT id FROM users   WHERE email = 'coach@silverlake.test'),
  'ST',
  8, 7, 8, 9, 9, 5, 7, 9, 8,
  'Fantastic match! Carlos scored 2 great goals and set up another with a clever pass. He showed real composure in front of goal and his movement off the ball was excellent. Keep encouraging him to work on both feet at home — he has a very bright future.',
  'COACH ONLY — Carlos tends to drift too central when space is available on the left flank. His defensive tracking when the team loses the ball is inconsistent. Tactically strong going forward but needs a full game to address the defensive side before we consider moving him up to select. Do not share this assessment with the family yet.'
WHERE NOT EXISTS (
  SELECT 1 FROM player_match_evaluations pme
  WHERE pme.match_id  = (SELECT m.id FROM matches m JOIN teams t ON m.team_id = t.id WHERE m.opponent = 'FC Oakland' AND t.name = '2015 Boys Orange' LIMIT 1)
    AND pme.player_id = (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez')
);

-- ─────────────────────────────────────────
-- Development reports for Carlos Mendez
-- Report 1: approved — parent CAN see this
-- Report 2: unapproved — parent CANNOT see this (server enforces; UI double-guards)
-- ─────────────────────────────────────────

-- Approved report
INSERT INTO development_reports
  (player_id, season_id, generated_by_user_id,
   title, strengths, areas_to_improve, training_focus, parent_summary, coach_only_analysis,
   approved_for_parent)
SELECT
  (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez'),
  (SELECT id FROM seasons WHERE name = '2025-2026' LIMIT 1),
  (SELECT id FROM users   WHERE email = 'coach@silverlake.test'),
  'Fall 2025 Mid-Season Assessment',
  'Exceptional finishing ability and movement in the final third. Strong pressing and work rate. High soccer IQ for the age group. Leads the team in goals and assists through the first half of Fall 2025.',
  'Defensive tracking runs when possession is lost. First touch under pressure in central midfield areas.',
  'Shadow defensive drills (3× per week). Rondo possession exercises to sharpen first touch. Finishing with non-dominant left foot.',
  'Carlos has had an outstanding first half of the Fall 2025 season. He is one of our top performers and a joy to coach. We encourage you to keep supporting him with regular ball touches at home, proper rest before match days, and staying positive after any difficult moments. He is developing beautifully.',
  'INTERNAL: Tactically, Carlos needs to develop off-ball movement when the team is out of possession — he switches off too quickly. Defensively inconsistent. With dedicated development I believe he can compete at select/elite level by U12. I want to discuss a potential team move with the family at the end-of-season meeting. Hold this assessment until then.',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM development_reports
  WHERE title = 'Fall 2025 Mid-Season Assessment'
    AND player_id = (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez')
);

-- Unapproved report (parent cannot access — server returns 403; UI also double-filters)
INSERT INTO development_reports
  (player_id, season_id, generated_by_user_id,
   title, strengths, areas_to_improve, training_focus, parent_summary, coach_only_analysis,
   approved_for_parent)
SELECT
  (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez'),
  (SELECT id FROM seasons WHERE name = '2025-2026' LIMIT 1),
  (SELECT id FROM users   WHERE email = 'coach@silverlake.test'),
  'Spring 2026 Pre-Season Assessment — DRAFT',
  'Maintained excellent fitness over winter break. Showing early improvement in defensive positioning. Natural leadership qualities emerging with younger players on the roster.',
  'Long-range shooting technique. Aerial duel confidence. Training consistency — a few distracted sessions noted.',
  'Wide play and crossing/finishing combinations. Strength and conditioning for aerial work. 1v1 defensive pressure drills.',
  '',
  'DRAFT — DO NOT RELEASE TO PARENT. Carlos has shown inconsistent focus in several pre-season training sessions. I am aware of some off-field factors that may be contributing. I want to address this privately in a 1:1 before sharing anything with the family. This report should NOT be approved until I have had that conversation.',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM development_reports
  WHERE title = 'Spring 2026 Pre-Season Assessment — DRAFT'
    AND player_id = (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez')
);

COMMIT;
