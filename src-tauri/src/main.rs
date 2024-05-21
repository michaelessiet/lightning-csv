// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{clone, io, path::PathBuf};

use csv::{self};
use serde_json::{self, Value};
// use tauri::{CustomMenuItem, Menu, Submenu};

#[derive(Debug, Clone)]
pub enum Error {
    DialogClosed,
    IoError(io::ErrorKind),
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn open_csv() -> Result<PathBuf, Error> {
    let picked_file = rfd::FileDialog::new()
        .set_title("Open a CSV file...")
        .add_filter("csv filter", &["csv"])
        .pick_file()
        .ok_or(Error::DialogClosed)?;

    Ok(picked_file.into())
}

static mut CSV_DATA: Option<Value> = None;

fn save_csv_data(value: Value) {
    unsafe {
        CSV_DATA = Some(value);
    }
}

#[tauri::command]
fn read_csv(start: i32, end: i32) -> Value {
    let mut json = serde_json::json!({});

    if unsafe { CSV_DATA.is_none() } {
        let path = open_csv().ok();

        if path.is_none() {
            return json;
        }

        let path = path.unwrap();

        print!("{}", path.display());

        let mut reader = csv::Reader::from_path(path).unwrap();
        let headers = reader.headers().unwrap().clone();

        json["headers"] = Value::Array(
            headers
                .iter()
                .map(|x| Value::String(x.to_string()))
                .collect(),
        );

        json["data"] = Value::Array(
            reader
                .records()
                .map(|x| {
                    let record = x.unwrap();
                    Value::Array(
                        record
                            .iter()
                            .map(|x| Value::String(x.to_string()))
                            .collect(),
                    )
                })
                .collect(),
        );
    } else {
        json = unsafe { CSV_DATA.clone().unwrap() };
    }

    save_csv_data(json.clone());
    print!("{}", json["data"].as_array().unwrap().len());

    // filter data
    let data = json["data"].as_array_mut().unwrap();
    let mut new_data = Vec::new();
    for i in start..std::cmp::min(end, data.len() as i32) {
        new_data.push(clone::Clone::clone(&data[i as usize]));
    }

    json["data"] = Value::Array(new_data);

    return json;
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, read_csv])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
