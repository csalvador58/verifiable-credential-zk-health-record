use sqlx::{PgPool, ConnectOptions};
use sqlx::postgres::PgPoolOptions;
use actix_web::middleware::Logger;
use actix_web::{get, post, put, delete, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use std::io;

#[derive(Serialize)]
pub struct GenericResponse {
    pub status: String,
    pub message: String,
}

#[derive(Serialize)]
pub struct Item {
    pub id: i32,
    pub name: String,
}

#[get("/api/status")]
async fn status_handler() -> impl Responder {
    const MESSAGE: &str = "Status GOOD";

    let response_json = &GenericResponse {
        status: "success".to_string(),
        message: MESSAGE.to_string(),
    };
    HttpResponse::Ok().json(response_json)
}

// Create pool of db connections
async fn create_pool() -> Result<PgPool, sqlx::Error> {
    let _db = std::env::var("DATABASE_URL").expect("DATABASE_URL is not set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://postgres:password@localhost:5432/test").await?;
    Ok(pool)
}


#[actix_web::main]
async fn main() -> io::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }
    env_logger::init();

    println!("Server is running...");

    let db_pool = create_pool().await.expect("Failed to create db pool");

    HttpServer::new(move || {
        App::new()
            .app_data(db_pool.clone())
            .service(status_handler)
            .wrap(Logger::default())
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}