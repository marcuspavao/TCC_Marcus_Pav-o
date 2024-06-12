// @generated automatically by Diesel CLI.

diesel::table! {
    data_sensors (id) {
        id -> Int4,
        sensor_id -> Int4,
        sensor_data -> Json,
        date -> Timestamptz,
    }
}

diesel::table! {
    sensors (id) {
        id -> Int4,
        name -> Varchar,
        description -> Text,
        local -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        name -> Varchar,
        password -> Text,
        email -> Text,
    }
}

diesel::joinable!(data_sensors -> sensors (sensor_id));

diesel::allow_tables_to_appear_in_same_query!(
    data_sensors,
    sensors,
    users,
);
