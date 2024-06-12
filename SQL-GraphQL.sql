select create_hypertable('data_sensors', 'date');

CREATE VIEW last_20_min_temp_correct AS (
  SELECT time_bucket('5 seconds', date) AS five_sec_interval,     
    MAX(sensor_data::json->>'temperature') AS max_temp
  FROM data_sensors
  WHERE date > NOW() - interval '20 minutes'   
  GROUP BY five_sec_interval    
  having cast(MAX(sensor_data::json->>'temperature') as INT)<> 0
  ORDER BY five_sec_interval ASC
);

select * from last_20_min_temp_1 lmt 
