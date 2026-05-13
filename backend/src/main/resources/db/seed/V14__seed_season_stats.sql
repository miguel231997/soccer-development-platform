-- V14: Seed player season stats + additional players for percentile testing
-- Local dev only (db/seed directory).
-- Idempotent: uses WHERE NOT EXISTS / ON CONFLICT DO NOTHING

BEGIN;

-- ─── Additional players ───────────────────────────────────────────────────────

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Marco', 'Silva', '2015-03-08', 'CF', 'RIGHT', 10, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Marco' AND last_name = 'Silva');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Alex', 'Turner', '2015-07-14', 'CAM', 'CM', 'RIGHT', 7, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Alex' AND last_name = 'Turner');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Jordan', 'Hayes', '2015-01-22', 'CDM', 'CM', 'RIGHT', 6, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Jordan' AND last_name = 'Hayes');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Sam', 'Ortiz', '2015-10-11', 'RW', 'RIGHT', 21, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Sam' AND last_name = 'Ortiz');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Tyler', 'Ross', '2015-05-29', 'CM', 'CAM', 'RIGHT', 14, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Tyler' AND last_name = 'Ross');

INSERT INTO players (first_name, last_name, date_of_birth, primary_position, secondary_position, strong_foot, jersey_number, public_profile_enabled, active)
SELECT 'Ryan', 'Park', '2015-08-03', 'LB', 'LWB', 'LEFT', 3, true, true
WHERE NOT EXISTS (SELECT 1 FROM players WHERE first_name = 'Ryan' AND last_name = 'Park');

-- ─── Assign new players to 2015 Boys Orange ───────────────────────────────────

INSERT INTO player_team_assignments (player_id, team_id, season_id, active)
SELECT p.id, t.id, s.id, true
FROM players p, teams t, seasons s
WHERE p.first_name = 'Marco' AND p.last_name = 'Silva'
  AND t.name = '2015 Boys Orange'
  AND s.name = '2025-2026'
  AND NOT EXISTS (
    SELECT 1 FROM player_team_assignments pta
    WHERE pta.player_id = p.id AND pta.team_id = t.id
  );

INSERT INTO player_team_assignments (player_id, team_id, season_id, active)
SELECT p.id, t.id, s.id, true
FROM players p, teams t, seasons s
WHERE p.first_name = 'Alex' AND p.last_name = 'Turner'
  AND t.name = '2015 Boys Orange'
  AND s.name = '2025-2026'
  AND NOT EXISTS (
    SELECT 1 FROM player_team_assignments pta
    WHERE pta.player_id = p.id AND pta.team_id = t.id
  );

INSERT INTO player_team_assignments (player_id, team_id, season_id, active)
SELECT p.id, t.id, s.id, true
FROM players p, teams t, seasons s
WHERE p.first_name = 'Jordan' AND p.last_name = 'Hayes'
  AND t.name = '2015 Boys Orange'
  AND s.name = '2025-2026'
  AND NOT EXISTS (
    SELECT 1 FROM player_team_assignments pta
    WHERE pta.player_id = p.id AND pta.team_id = t.id
  );

INSERT INTO player_team_assignments (player_id, team_id, season_id, active)
SELECT p.id, t.id, s.id, true
FROM players p, teams t, seasons s
WHERE p.first_name = 'Sam' AND p.last_name = 'Ortiz'
  AND t.name = '2015 Boys Orange'
  AND s.name = '2025-2026'
  AND NOT EXISTS (
    SELECT 1 FROM player_team_assignments pta
    WHERE pta.player_id = p.id AND pta.team_id = t.id
  );

INSERT INTO player_team_assignments (player_id, team_id, season_id, active)
SELECT p.id, t.id, s.id, true
FROM players p, teams t, seasons s
WHERE p.first_name = 'Tyler' AND p.last_name = 'Ross'
  AND t.name = '2015 Boys Orange'
  AND s.name = '2025-2026'
  AND NOT EXISTS (
    SELECT 1 FROM player_team_assignments pta
    WHERE pta.player_id = p.id AND pta.team_id = t.id
  );

INSERT INTO player_team_assignments (player_id, team_id, season_id, active)
SELECT p.id, t.id, s.id, true
FROM players p, teams t, seasons s
WHERE p.first_name = 'Ryan' AND p.last_name = 'Park'
  AND t.name = '2015 Boys Orange'
  AND s.name = '2025-2026'
  AND NOT EXISTS (
    SELECT 1 FROM player_team_assignments pta
    WHERE pta.player_id = p.id AND pta.team_id = t.id
  );

-- ─── Player season stats ──────────────────────────────────────────────────────
-- goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
-- chances_created, successful_crosses, successful_dribbles, duels_won,
-- dispossessed, fouls_won, tackles, interceptions, fouls_committed,
-- blocked_shots, clearances, goals_conceded, yellow_cards, red_cards

-- Carlos Mendez (ST) — strong attacker
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Carlos' AND last_name = 'Mendez'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  18, 55, 28, 5, 120, 8, 22, 3, 25, 65, 12, 18, 10, 5, 15, 3, 4, 8, 2, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Marco Silva (CF) — strongest attacker
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Marco' AND last_name = 'Silva'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  22, 70, 35, 3, 100, 5, 18, 2, 20, 55, 18, 12, 8, 4, 18, 2, 3, 6, 3, 1
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Alex Turner (CAM) — strongest passer / chance creator
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Alex' AND last_name = 'Turner'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  5, 22, 10, 18, 320, 30, 55, 15, 40, 85, 10, 28, 18, 12, 8, 4, 5, 4, 1, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Diego Alvarez (CM) — box-to-box midfielder
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Diego' AND last_name = 'Alvarez'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  8, 30, 15, 12, 280, 25, 40, 8, 35, 90, 8, 22, 25, 18, 10, 5, 8, 5, 1, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Ethan Brooks (LW) — creative winger
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Ethan' AND last_name = 'Brooks'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  10, 40, 18, 15, 200, 15, 35, 22, 55, 75, 14, 20, 15, 8, 12, 3, 5, 7, 2, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Jordan Hayes (CDM) — strongest defender/midfielder
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Jordan' AND last_name = 'Hayes'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  2, 10, 4, 6, 260, 35, 15, 5, 18, 95, 6, 10, 55, 42, 20, 18, 35, 5, 3, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Noah Kim (CB) — strong center back
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Noah' AND last_name = 'Kim'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  3, 12, 5, 4, 230, 40, 10, 3, 10, 85, 5, 8, 50, 38, 22, 20, 45, 4, 2, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Ryan Park (LB) — attacking fullback
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Ryan' AND last_name = 'Park'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  1, 8, 3, 8, 240, 28, 20, 18, 22, 80, 7, 14, 38, 28, 16, 10, 30, 6, 2, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Liam Chen (GK) — goalkeeper
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Liam' AND last_name = 'Chen'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  0, 1, 0, 0, 80, 10, 2, 0, 2, 25, 3, 2, 12, 8, 5, 15, 20, 15, 1, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Tyler Ross (CM) — balanced midfielder
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Tyler' AND last_name = 'Ross'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  6, 25, 12, 9, 220, 18, 28, 10, 28, 70, 9, 16, 30, 20, 14, 7, 12, 5, 2, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

-- Sam Ortiz (RW) — low-stats player
INSERT INTO player_season_stats
  (player_id, team_id, season_id,
   goals, shots, shots_on_target, assists, successful_passes, accurate_long_balls,
   chances_created, successful_crosses, successful_dribbles, duels_won,
   dispossessed, fouls_won, tackles, interceptions, fouls_committed,
   blocked_shots, clearances, goals_conceded, yellow_cards, red_cards)
SELECT
  (SELECT id FROM players WHERE first_name = 'Sam' AND last_name = 'Ortiz'),
  (SELECT id FROM teams   WHERE name = '2015 Boys Orange'),
  (SELECT id FROM seasons WHERE name = '2025-2026'),
  2, 15, 5, 3, 140, 8, 12, 8, 15, 45, 16, 10, 12, 6, 8, 2, 3, 6, 1, 0
ON CONFLICT ON CONSTRAINT uq_pss_player_team_season DO NOTHING;

COMMIT;
