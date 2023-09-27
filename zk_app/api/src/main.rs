use host::zkvm_host;
use std::env;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
mod resources;

#[macro_use]
extern crate serde_derive;

const OK_RESPONSE: &str = "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n";
const NOT_FOUND_RESPONSE: &str = "HTTP/1.1 404 NOT FOUND\r\n\r\n";
const INTERNAL_SERVER_ERROR_RESPONSE: &str = "HTTP/1.1 500 INTERNAL SERVER ERROR\r\n\r\n";

fn main() {
    // start server and print port
    let listener = TcpListener::bind(format!("0.0.0.0:8080")).unwrap();
    println!("Listening on port {}", 8080);

    // accept connections and process them serially
    for stream in listener.incoming() {
        match stream {
            Ok(stream) => {
                handle_request(stream);
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
}

// handle routes
// TODO: add more routes
fn handle_request(mut stream: TcpStream) {
    let mut buffer = [0; 1024];
    let mut request = String::new();

    match stream.read(&mut buffer) {
        Ok(size) => {
            request.push_str(String::from_utf8_lossy(&buffer[..size]).as_ref());

            let (status_line, content) = match &*request {
                req if req.starts_with("GET /zkp/validate_proof") => validate_proof(req),
                _ => (NOT_FOUND_RESPONSE.to_string(), "404 Not Found".to_string()),
            };

            stream
                .write_all(format!("{}{}", status_line, content).as_bytes())
                .unwrap();
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }
}

// Controllers
// TODO: add more controllers
fn validate_proof(request: &str) -> (String, String) {
    match get_request_body(&request) {
        Ok(body) => {
            println!("Request Body: ");
            let vc_data = format!("{:?}", body);
            println!("Verifiable Credential Data: {:?}", vc_data);

            // response back with request body
            (OK_RESPONSE.to_string(), vc_data)
            // let zkp_receipt = zkvm_host(vc_data);
            // let response = format!("{{\"hash\": {:?}, \"verifiable_data\": {:?}}}", zkp_receipt.hash, String::from_utf8(zkp_receipt.verifiable_data).unwrap());
            // (OK_RESPONSE.to_string(), response)
        }
        _ => (
            INTERNAL_SERVER_ERROR_RESPONSE.to_string(),
            "500 Internal Server Error".to_string(),
        ),
    }
}

// deserialize json from request body
// TODO: add more models
fn get_request_body(request: &str) -> Result<resources::VerifiableCredential, serde_json::Error> {
    serde_json::from_str(request.split("\r\n\r\n").last().unwrap_or_default())
}
