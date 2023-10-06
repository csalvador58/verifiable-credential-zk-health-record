use actix_web::http::header::{self, ContentType};
use actix_web::{
    delete, get, post, put, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
    ResponseError, Result, error::Error as ActixError,
};
use host::zkvm_host;
use risc0_zkvm::Receipt;
use std::env;
use std::io::{Read, Write};
use zk_methods::VALIDATE_ID;

use serde::{Deserialize, Serialize};

use json_core::Outputs;
use risc0_zkvm::serde::{from_slice};

use std::fmt::Display;
use std::sync::Mutex;

mod resources;

#[derive(Serialize, Deserialize, Debug)]
struct ZKResponse {
    hash: String,
    requester: String,
    authoredOn: String,
    status: String,
    subject: String,
    medicationCodeableConcept: String,
    resourceType: String,
    image_id: [u32; 8],
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server has been started on http://localhost:8080");

    HttpServer::new(move || {
        App::new()
            .wrap(
                actix_cors::Cors::default()
                    .allowed_origin("http://localhost:3001")
                    .allowed_methods(vec!["GET", "POST", "PATCH", "DELETE"])
                    .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
                    .allowed_header(header::CONTENT_TYPE)
                    .expose_headers(&[header::CONTENT_DISPOSITION])
                    .supports_credentials()
                    .max_age(3600),
            )
            .service(create_zkp_medical_request)
            .service(verify_zkp)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await

}

// handle routes

#[post("/zkp/verify")]
async fn verify_zkp(
    req: web::Json<resources::ImageId>,
) -> std::result::Result<HttpResponse, ActixError> {
    let new_image_id = resources::ImageId {
        image: req.image,
    };

    println!("new_image_id: {:?}", new_image_id.image);

    // read last generated receipt from zkp_receipt.json file
    let receipt_json = std::fs::read_to_string("zkp_receipt.json").unwrap();

    // deserialize receipt
    let receipt: Receipt = serde_json::from_str(&receipt_json).unwrap();

    // verify receipt with new_image_id
    let result = receipt.verify(new_image_id.image);

    match result {
        Ok(_) => Ok(HttpResponse::Ok()
            .content_type(ContentType::json())
            .json(true)),
        Err(_) => Ok(HttpResponse::BadRequest()
            .content_type(ContentType::json())
            .json(false)),
    }
    
}

#[post("/zkp/create-medication-request")]
async fn create_zkp_medical_request(
    req: web::Json<resources::MedicationRequest>,
) -> impl Responder {
    let new_med_request = resources::MedicationRequest {
        id: String::from(&req.id),
        meta: resources::Meta {
            profile: req.meta.profile.iter().map(|s| String::from(s)).collect(),
            versionId: String::from(&req.meta.versionId),
            lastUpdated: String::from(&req.meta.lastUpdated),
            author: resources::Author {
                reference: String::from(&req.meta.author.reference),
                display: String::from(&req.meta.author.display),
            },
            project: String::from(&req.meta.project),
            compartment: match &req.meta.compartment {
                Some(c) => Some(
                    c.iter()
                        .map(|s| resources::Compartment {
                            reference: String::from(&s.reference),
                        })
                        .collect(),
                ),
                None => None,
            },
        },
        status: String::from(&req.status),
        intent: String::from(&req.intent),
        medicationCodeableConcept: resources::MedicationCodeableConcept {
            coding: req
                .medicationCodeableConcept
                .coding
                .iter()
                .map(|s| resources::Coding {
                    system: String::from(&s.system),
                    code: String::from(&s.code),
                    display: String::from(&s.display),
                })
                .collect(),
            text: String::from(&req.medicationCodeableConcept.text),
        },
        subject: resources::Subject {
            reference: String::from(&req.subject.reference),
        },
        encounter: resources::Encounter {
            reference: String::from(&req.encounter.reference),
        },
        authoredOn: String::from(&req.authoredOn),
        requester: resources::Requester {
            reference: String::from(&req.requester.reference),
            display: String::from(&req.requester.display),
        },
        reasonReference: req
            .reasonReference
            .iter()
            .map(|s| resources::ReasonReference {
                reference: String::from(&s.reference),
            })
            .collect(),
        resourceType: String::from(&req.resourceType),
    };

    let new_med_request_to_string = serde_json::to_string(&new_med_request).unwrap();
    let zkp_receipt = zkvm_host(&new_med_request_to_string);

    // transform zkp_receipt to json object as is
    let zkp_receipt_json_object = serde_json::to_string(&zkp_receipt).unwrap();

    // write receipt to file located in root of the project
    let mut file = std::fs::File::create("zkp_receipt.json").unwrap();
    file.write_all(zkp_receipt_json_object.as_bytes()).unwrap();

    //  Deserialize receipt
    let output: Outputs = from_slice(&zkp_receipt.journal).expect("Failed to deserialize receipt");

    let response: ZKResponse = ZKResponse {
        hash: format!("{:?}", output.hash),
        requester: String::from_utf8(output.requester.clone())
            .expect("Invalid UTF-8 sequence in requester"),
        authoredOn: String::from_utf8(output.authoredOn.clone())
            .expect("Invalid UTF-8 sequence in authoredOn"),
        status: String::from_utf8(output.status.clone())
            .expect("Invalid UTF-8 sequence in status"),
        subject: String::from_utf8(output.subject.clone())
            .expect("Invalid UTF-8 sequence in subject"),
        medicationCodeableConcept: String::from_utf8(output.medicationCodeableConcept.clone())
            .expect("Invalid UTF-8 sequence in medicationCodeableConcept"),
        resourceType: String::from_utf8(output.resourceType.clone())
            .expect("Invalid UTF-8 sequence in resourceType"),
        image_id: VALIDATE_ID,
    };

    HttpResponse::Ok()
        .content_type(ContentType::json())
        .json(response)
}
