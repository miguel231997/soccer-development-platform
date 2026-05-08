-- V4: Associate users with a club.
--     DIRECTOR users need a club reference to scope their access.
--     Nullable so ADMIN, COACH, PARENT and PLAYER rows are unaffected.

ALTER TABLE users ADD COLUMN club_id BIGINT REFERENCES clubs(id);

CREATE INDEX idx_users_club_id ON users(club_id);
