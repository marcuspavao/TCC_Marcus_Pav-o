
use std::{env, process};
use diesel::insert_into;
use mqtt::Message;
//use settimeout::set_timeout;
use std::time::Duration;
use paho_mqtt as mqtt;
extern crate diesel;
use diesel::prelude::*;
use diesel::pg::PgConnection;
use crate::models::{DataSensor, NewDataSensor, NewSensor, NewUser, Sensor, User};
extern crate dotenv;

use dotenv::dotenv;


// async fn foo() {
//     println!("Timeout");
//     set_timeout(Duration::from_secs(2)).await;
//     println!("End");
//   }

pub mod schema;
pub mod models;

pub fn establish_connection() -> PgConnection {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set.");

    PgConnection::establish(&database_url).unwrap_or_else(|_| panic!("Error connecting to {}", "database"))
} 

pub fn insert_user(conn: &mut PgConnection, msg: &Message) -> QueryResult<usize> {
    use schema::users::dsl::*;

    let user : User = match serde_json::from_str(&msg.payload_str()) {
        Ok(user) => user,
        Err(err) => {
            eprintln!("Failed to deserialize JSON: {}", err);
            return Ok(0);
        }
    };

    // let _x = insert_user(connection,  &user.name,  &user.password,  &user.email);


    let data = NewUser { name: &user.name, password: &user.password, email: &user.email };

    insert_into(users).values(&data).execute(conn)
}

pub fn insert_sensor(conn: &mut PgConnection, msg: &Message) -> QueryResult<usize> {
    use schema::sensors::dsl::*;

    let sensor : Sensor = match serde_json::from_str(&msg.payload_str()) {
        Ok(sensor) => sensor,
        Err(err) => {
            eprintln!("Failed to deserialize JSON: {}", err);
            return Ok(0);
        }
    };

    let data = NewSensor { name: &sensor.name, description: &sensor.description, local: &sensor.local };

    insert_into(sensors).values(&data).execute(conn)
}

pub fn insert_data_sensor(conn: &mut PgConnection, msg: &Message) -> QueryResult<usize> {
    use schema::data_sensors::dsl::*;

    let data_sensor : DataSensor = match serde_json::from_str(&msg.payload_str()) {
        Ok(data_sensor) => data_sensor,
        Err(err) => {
            eprintln!("Failed to deserialize JSON: {}", err);
            return Ok(0);
        }
    };

    let data = NewDataSensor { sensor_id: &data_sensor.sensor_id, sensor_data: &data_sensor.sensor_data };

    insert_into(data_sensors).values(&data).execute(conn)
}

fn main() {
    dotenv().ok();

    let mqtt_url = env::var("MQTT_URL").expect("MQTT_URL must be set.");

    // Create a client & define connect options
    let cli = mqtt::AsyncClient::new(mqtt_url)
    .unwrap_or_else(|err| {
        println!("Error creating the client: {:?}", err);
        process::exit(1);
    });

    //let connection = PgConnection::establish("postgres://username:password@localhost/rust_postgres").unwrap();

    let connection = &mut establish_connection();

    println!("Connection to the database established!");
    
    let conn_opts = mqtt::ConnectOptionsBuilder::new()
        .keep_alive_interval(Duration::from_secs(20))
        .clean_session(true)
        .finalize();

    // Connect and wait for it to complete or fail
    if let Err(e) = cli.connect(conn_opts).wait() {
        println!("Unable to connect:\n\t{:?}", e);
        process::exit(1);
    }

    let rx = cli.start_consuming();

    cli.subscribe("user", 2);
    cli.subscribe("sensors", 2);
    cli.subscribe("data_sensors", 2);

    // Create a message and publish it
    //let msg = mqtt::Message::new("testa", "Hello world!", 2);
    //let tok = cli.publish(msg);

    print!("{}\n", cli.is_connected());

    //if let Err(e) = tok.wait() {
    //    println!("Error sending message: {:?}", e);
    //} 

    println!("\nWaiting for messages on topics");
    for msg in rx.iter() {
        if let Some(msg) = msg {
        
            //println!("{:?}", &msg.topic().replace("\\", "")); Discover what's the topic name

            match &msg.topic().replace("\\", "").as_str() {
                &"user" => {
                    println!("{:?}", &msg.topic().replace("\\", ""));
                    let _ = insert_user(connection, &msg) ;
                }
                &"sensors" => {
                    println!("{:?}", &msg.topic().replace("\\", ""));
                    let _ = insert_sensor(connection, &msg);              
                }
                &"data_sensors" => {
                    println!("{:?}", &msg.topic().replace("\\", ""));
                    let _ = insert_data_sensor(connection, &msg);              
                }
                _ => {
                    println!("Topic does not match any expected value");
                }
            }

            //block_on(foo());
        }
        else if cli.is_connected() {
            break;
        }
    }

    let disc = mqtt::disconnect_options::DisconnectOptions::new();

    // Disconnect from the broker
    let tok = cli.disconnect(disc);
    tok.wait().unwrap();
    print!("{}", cli.is_connected());
}