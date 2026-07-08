
use std::{error::Error, sync::{Arc, Mutex}};

use rusqlite::{Connection, Result};
use serde::Serialize;
use tracing::{error};

#[derive(Clone, Debug, Serialize)]
pub struct Bookmark{
    pub id: i16,
    pub title: String,
    pub url : String,
    pub created_at: String,
}

#[derive(Clone)]
pub struct BookmarkRepository{
    pub repo: Arc<Mutex<Connection>>,
}

impl BookmarkRepository{
    pub fn get(&self, search: Option<String>, page: Option<i64>, limit: Option<i64>, sort: Option<String>) -> Result<Vec<Bookmark>, Box<dyn Error>> {
        // let mut bookmarks = Vec::new();
        let search_query = format!("%{}%", search.unwrap_or_default());
        let current_page = page.unwrap_or(0);
        let limit_row = limit.unwrap_or(10);
        let sort_type = sort.unwrap_or("desc".to_string()).to_uppercase();

        let query = format!("SELECT * FROM bookmark WHERE title LIKE ?1 OR url LIKE ?1 ORDER BY created_at {} LIMIT ?2 OFFSET ?3", sort_type);

        let db = self.repo.lock().map_err(|_| "failed lock db to process")?;

        let mut prepare = db.prepare(&query)?;

        
        let bookmark_iter = prepare.query_map([search_query, limit_row.to_string(), current_page.to_string()], |row|{
            Ok(Bookmark{
                id: row.get(0)?,
                title: row.get(1)?,
                url: row.get(2)?,
                created_at: row.get(3)?,
            })
        }).map_err(|e| e.to_string())?;

        let bookmarks = bookmark_iter.collect::<Result<Vec<Bookmark>, rusqlite::Error>>()?;
        
        Ok(bookmarks)
    }

    pub fn add(&self, title: String, url: String)-> Result<String, Box<dyn Error>>{
        let query = "INSERT INTO bookmark (title, url) VALUES(?1,?2)";

        let db = self.repo.lock().map_err(|_| "failed lock db to process")?;
        match db.execute(query, (title, url)) {
            Ok(_)=> {
                Ok("success add url".to_string())
            }

            Err(e)=>{
                error!("{}", e.to_string());
                Err("failed add url to bookmark".into())
            }
        }

    }

    // pub fn delete(&self, id: String) -> Result<String, Box<dyn Error>>{
    //     let query = "DELETE FROM bookmark WHERE id=?1";
    //
    //     let db = self.repo.lock().map_err(|_| "failed lock database")?;
    //
    //     match db.execute(query, (id,)) {
    //         Ok(_)=> {
    //             Ok("success delete bookmark".to_string())
    //         }
    //         Err(e)=>{
    //             error!("{}", e.to_string());
    //             Err("failed delete bookmark".into())
    //         }
    //     }
    //
    // }
}
