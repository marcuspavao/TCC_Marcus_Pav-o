-- Your SQL goes here
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  password TEXT NOT NULL,
  email TEXT NOT NULL
)