
use std::{ error::Error, net::SocketAddr};

use jsonrpsee::{proc_macros::rpc, server::{Server}, types::ErrorObjectOwned};
use serde::Serialize;
use tower_http::cors::{Any, CorsLayer};
use hyper::Method;
use tracing::{info, error};

use crate::jsonrpc::repository::{BookmarkRepository};

#[derive(Clone, Serialize)]
pub struct Response{
    message: String,
}

// #[derive(Clone, Serialize)]
// pub struct UrlResponse{
//     url: String
// }

#[rpc(server)]
trait RpcApi {
    #[method(name="add_url")]
    fn add_url(&self,title: String, url: String) -> Result<Response, ErrorObjectOwned>;
    
    // #[method(name="get_urls")]
    // fn get_urls(&self) -> Result<Vec<Bookmark>, ErrorObjectOwned>;
    //
    // #[method(name="delete_url")]
    // fn delete_url(&self, id: String) -> Result<Response, ErrorObjectOwned>;
}

struct RpcImplent{
    bookmark_repo: BookmarkRepository
}

// because jsonrpsee change name impl from struct
// name struct in impl adding suffix `Server`
// so when your trait have name `RpcApi`
// then jsonrpsee will change the name of `impl`` is `RpcApiServer``
impl RpcApiServer for RpcImplent{
    fn add_url(&self, title: String, url: String) -> Result<Response, jsonrpsee::types::ErrorObjectOwned>{

        match self.bookmark_repo.add(title, url){
            Ok(status) => {
                let res = Response{
                    message: status
                };
                Ok(res)
            }
            Err(e)=> {
                error!(e);
                let err = ErrorObjectOwned::owned(-1, "failed add url", None::<()>);
                Err(err)
            }
        }
    }

    // fn get_urls(&self) -> Result<Vec<Bookmark> ,ErrorObjectOwned> {
    //     match self.bookmark_repo.get() {
    //         Ok(data) =>{
    //             Ok(data)
    //         }
    //         Err(e )=>{
    //             error!(e);
    //             Err(ErrorObjectOwned::owned(-1, "failed get bookmarks", None::<()>))
    //         }
    //     }
    // }
    //
    // fn delete_url(&self,id:String) -> Result<Response, ErrorObjectOwned> {
    //     match self.bookmark_repo.delete(id){
    //         Ok(message)=>{
    //             let res = Response{
    //                 message
    //             };
    //             Ok(res)
    //         }
    //         Err(e)=>{
    //             error!(e);
    //             let err = ErrorObjectOwned::owned(-1, "failed delete bookmark", None::<()>);
    //             Err(err)
    //         }
    //     }
    // }
}

pub async fn run(bookmark_repository: BookmarkRepository) -> Result<(), Box<dyn Error>> {
    tracing_subscriber::fmt::init();
   


    let cors_layer = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::POST])
        .allow_headers([hyper::header::CONTENT_TYPE]);
    let middleware = tower::ServiceBuilder::new().layer(cors_layer);


    let addr = SocketAddr::from(([0,0,0,0], 6644));
    let server = Server::builder()
        .set_http_middleware(middleware)
        .build(addr)
        .await?;

    
    let module = RpcImplent{
        bookmark_repo: bookmark_repository 
    }.into_rpc();

    let handle = server.start(module);
    info!("server starting at {}", addr);
    handle.stopped().await;
    Ok(())
}

