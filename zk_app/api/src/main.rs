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

#[derive(Serialize, Deserialize, Debug)]
struct ZKResponse {
    hash: String,
    verifiable_data_1: String,
    verifiable_data_2: String,
    verifiable_data_3: String,
    verifiable_data_4: String,
    verifiable_data_5: String,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Server has been started on http://localhost:8000");

    HttpServer::new(move || App::new().service(create_zkp_medical_request))
        .bind(("127.0.0.1", 8000))?
        .run()
        .await
}

// handle routes
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

    let new_vc_to_string = serde_json::to_string(&new_vc).unwrap();
    let zkp_receipt = zkvm_host(&new_vc_to_string);
    let response = format!(
        "{{\"hash\": {:?}, \"verifiable_data\": {:?}}}",
        zkp_receipt.hash,
        String::from_utf8(zkp_receipt.verifiable_data_1).unwrap(),
    );

    HttpResponse::Created()
        .content_type(ContentType::json())
        .body(response)
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

    let response: ZKResponse = ZKResponse {
        hash: format!("{:?}", zkp_receipt.hash),
        verifiable_data_1: String::from_utf8(zkp_receipt.verifiable_data_1).unwrap(),
        verifiable_data_2: String::from_utf8(zkp_receipt.verifiable_data_2).unwrap(),
        verifiable_data_3: String::from_utf8(zkp_receipt.verifiable_data_3).unwrap(),
        verifiable_data_4: String::from_utf8(zkp_receipt.verifiable_data_4).unwrap(),
        verifiable_data_5: String::from_utf8(zkp_receipt.verifiable_data_5).unwrap(),
    };


    HttpResponse::Ok()
        .content_type(ContentType::json())
        .json(response)
    // HttpResponse::Created()
    //     .content_type(ContentType::json())
    //     .body(response)
}
