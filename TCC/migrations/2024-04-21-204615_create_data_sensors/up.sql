CREATE TABLE data_sensors (
  id SERIAL PRIMARY KEY,
  sensor_id INT NOT NULL,
  sensor_data JSON NOT NULL,
  date timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_sensor
    FOREIGN KEY(sensor_id) 
      REFERENCES sensors(id)
)