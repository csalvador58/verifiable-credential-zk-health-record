use actix_web::body::BoxBody;
use actix_web::http::header::ContentType;
use actix_web::http::StatusCode;
use actix_web::{
    delete, get, post, put, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
    ResponseError,
};
use host::zkvm_host;
use std::env;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};

use serde::{Deserialize, Serialize};

use std::fmt::Display;
use std::sync::Mutex;

mod resources;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server has been started on http://localhost:8000");

    HttpServer::new(move || App::new().service(create_zkp))
        .bind(("127.0.0.1", 8000))?
        .run()
        .await
}

// handle routes
// TODO: add more routes
#[post("/zkp/create")]
async fn create_zkp(req: web::Json<resources::VerifiableCredential>) -> impl Responder {
    let new_vc = resources::VerifiableCredential {
        boolean_field: req.boolean_field,
        data: String::from(&req.data),
        obj_field: resources::ObjectField {
            string_subfield: String::from(&req.obj_field.string_subfield),
            array_subfield: req
                .obj_field
                .array_subfield
                .iter()
                .map(|s| String::from(s))
                .collect(),
        },
    };

    // let response = serde_json::to_string(&new_vc).unwrap();
    let new_vc_to_string = serde_json::to_string(&new_vc).unwrap();
    let zkp_receipt = zkvm_host(&new_vc_to_string);
    let response = format!(
        "{{\"hash\": {:?}, \"verifiable_data\": {:?}}}",
        zkp_receipt.hash,
        String::from_utf8(zkp_receipt.verifiable_data).unwrap()
    );

    HttpResponse::Created()
        .content_type(ContentType::json())
        .body(response)
}

/*
{"hash": Digest(1ef1cbfb2293b8915abad89364c54f931d176cf6237ce6343dd4590fb848357a), 
"verifiable_data": "secret sauce"}

{"hash": Digest(0d734f1cbd7048e796ae0ae9d4885848a4eaaa30be2aeb299827e7e7fb24b834), 
"verifiable_data": "secret"}
*/
