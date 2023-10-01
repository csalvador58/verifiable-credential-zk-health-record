use actix_cors::Cors;
use actix_web::body::BoxBody;
use actix_web::http::header::{self, ContentType};
use actix_web::http::StatusCode;
use actix_web::{
    delete, get, post, put, web, App, HttpRequest, HttpResponse, HttpServer, Responder,
    ResponseError,
};
use host::zkvm_host;
use std::env;
use std::io::{Read, Write};
use zk_methods::VALIDATE_ID;

use serde::{Deserialize, Serialize};

use json_core::Outputs;
use risc0_zkvm::serde::{from_slice, to_vec};

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
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await

    // HttpServer::new(move || App::new().service(create_zkp_medical_request))
    //     .bind(("127.0.0.1", 8080))?
    //     .run()
    //     .await
}

// handle routes
// #[post("/zkp/create")]
// async fn create_zkp(req: web::Json<resources::VerifiableCredential>) -> impl Responder {
//     let new_vc = resources::VerifiableCredential {
//         boolean_field: req.boolean_field,
//         data: String::from(&req.data),
//         obj_field: resources::ObjectField {
//             string_subfield: String::from(&req.obj_field.string_subfield),
//             array_subfield: req
//                 .obj_field
//                 .array_subfield
//                 .iter()
//                 .map(|s| String::from(s))
//                 .collect(),
//         },
//     };

//     // let response = serde_json::to_string(&new_vc).unwrap();
//     let new_vc_to_string = serde_json::to_string(&new_vc).unwrap();
//     let zkp_receipt = zkvm_host(&new_vc_to_string);
//     let response = format!(
//         "{{\"hash\": {:?}, \"verifiable_data\": {:?}}}",
//         zkp_receipt.hash,
//         String::from_utf8(zkp_receipt.requester).unwrap(),
//     );

//     HttpResponse::Created()
//         .content_type(ContentType::json())
//         .body(response)
// }

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

    // write response_object to file
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
    // HttpResponse::Created()
    //     .content_type(ContentType::json())
    //     .body(response)
}
