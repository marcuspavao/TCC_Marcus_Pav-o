-- Your SQL goes here
CREATE TABLE sensors (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT NOT NULL,
  local TEXT NOT NULL
)