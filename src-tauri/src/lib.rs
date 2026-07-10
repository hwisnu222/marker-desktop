use tauri::Manager;

use std::{fs, sync::{Arc, Mutex}};
use rusqlite::Connection;
use serde::{Serialize, Deserialize};

use crate::jsonrpc::repository::{Bookmark, BookmarkRepository};
mod jsonrpc;

#[derive(Serialize)]
pub struct PaginationResponse{
    data: Vec<Bookmark>,
    total_count: i64,
    total_page: i64
}

#[derive(Serialize, Deserialize)]
struct BookmarkRequest{
    search: Option<String>,
    page: Option<i64>,
    per_page: Option<i64>,
    sort: Option<String>
}

#[derive(Deserialize)]
struct DeleteParams{
    id: Option<i64>
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/ 
#[tauri::command]
fn get_bookmarks(
    repo: tauri::State<'_, BookmarkRepository>,
    params: BookmarkRequest
) -> Result<PaginationResponse, String>{
    let search = params.search;
    let page = params.page;
    let per_page = params.per_page;
    let sort = params.sort;

    println!("get bookmarks");
    match repo.get(search, page, per_page, sort){
        Ok(data) => {
            println!("{:?}", data);

            println!("success get data");
            Ok(PaginationResponse{
                data,
                total_count: 12,
                total_page: 13
            })
        }
        Err(e) =>{
            eprintln!("Error: {}", e);
            Err(format!("Error: {}", e))
        }
    }    
}

#[tauri::command]
fn delete_bookmark(repo: tauri::State<'_, BookmarkRepository>, params: DeleteParams)-> Result<String, String>{
    let id =  params.id.ok_or("can't empty id")?;

    match repo.delete(id){
        Ok(data)=>{
            println!("{}", data);
            Ok("success delete Bookmark".to_string())
        }
        Err(e)=>{
            eprintln!("{}", e);
            Err("failed delete bookmark".to_string())
        }
    }
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app|{

            let mut path = dirs::config_dir().expect("failed get config directory");
            path.push("marker-desktop");
            if !path.exists(){
                fs::create_dir_all(&path).expect("failed create config directory");
            }
            path.push("app.db");
            let path_db = path.to_str().unwrap();
            let conn = Connection::open(path_db)?;

            let sql = "CREATE TABLE IF NOT EXISTS bookmark (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                url TEXT UNIQUE,
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )";
            let _ = conn.execute(sql, ());

            let shared_conn = Arc::new(Mutex::new(conn));
            let bookmark_repository = BookmarkRepository{
                repo: shared_conn
            };

            app.manage(bookmark_repository.clone());

            tauri::async_runtime::spawn(async move{
                let _ = jsonrpc::server::run(bookmark_repository).await;
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_bookmarks, delete_bookmark])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
