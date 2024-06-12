use diesel::prelude::*;
use serde::Deserialize;

use crate::schema::data_sensors;
use crate::schema::users;
use crate::schema::sensors;

#[derive(Queryable, Deserialize, Ord, Eq, PartialEq, PartialOrd)] 
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct User {
    pub name: String,
    pub password: String,
    pub email: String,
}

#[derive(Insertable)]
#[diesel(table_name = users)]
pub struct NewUser<'a> {
    pub name: &'a str,
    pub password: &'a str,
    pub email: &'a str,
}

#[derive(Queryable, Deserialize, Ord, Eq, PartialEq, PartialOrd)] 
#[diesel(table_name = crate::schema::sensors)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Sensor {
    pub name: String,
    pub description: String,
    pub local: String,
}

#[derive(Insertable)]
#[diesel(table_name = sensors)]
pub struct NewSensor<'a> {
    pub name: &'a str,
    pub description: &'a str,
    pub local: &'a str,
}

#[derive(Queryable, Deserialize, Eq, PartialEq)] 
#[diesel(table_name = crate::schema::data_sensors)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct DataSensor {
    pub sensor_id: i32,
    pub sensor_data: serde_json::Value,
}


#[derive(Insertable)]
#[diesel(table_name = data_sensors)]
pub struct NewDataSensor<'a> {
    pub sensor_id: &'a i32,
    pub sensor_data: &'a serde_json::Value 
}