use serde::{Deserialize, Serialize};
use std::fmt::Display;

use actix_web::{
    body::BoxBody,
    http::{header::ContentType, StatusCode},
    HttpRequest, HttpResponse, Responder, ResponseError,
};
use std::sync::Mutex;

#[derive(Serialize, Deserialize, Debug)]
pub struct MedicationRequest {
    pub id: String,
    pub meta: Meta,
    pub status: String,
    pub intent: String,
    pub medicationCodeableConcept: MedicationCodeableConcept,
    pub subject: Subject,
    pub encounter: Encounter,
    pub authoredOn: String,
    pub requester: Requester,
    pub reasonReference: Vec<ReasonReference>,
    pub resourceType: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Meta {
    pub profile: Vec<String>,
    pub versionId: String,
    pub lastUpdated: String,
    pub author: Author,
    pub project: String,
    #[serde(default)]
    pub compartment: Option<Vec<Compartment>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Author {
    pub reference: String,
    pub display: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Compartment {
    pub reference: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MedicationCodeableConcept {
    pub coding: Vec<Coding>,
    pub text: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Coding {
    pub  system: String,
    pub code: String,
    pub display: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Subject {
    pub reference: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Encounter {
    pub reference: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Requester {
    pub reference: String,
    pub display: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ReasonReference {
    pub reference: String,
}

impl Responder for MedicationRequest {
    type Body = BoxBody;

    fn respond_to(self, _req: &HttpRequest) -> HttpResponse {
        let res_body = serde_json::to_string(&self).unwrap();

        HttpResponse::Ok()
            .content_type(ContentType::json())
            .body(res_body)
    }
}

#[derive(Debug, Serialize)]
struct ErrorResponse {
    error: String,
}

impl ResponseError for ErrorResponse {
    fn status_code(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }

    fn error_response(&self) -> HttpResponse<BoxBody> {
        let body = serde_json::to_string(self).unwrap();
        let res = HttpResponse::new(self.status_code());
        res.set_body(BoxBody::new(body))
    }
}

impl Display for ErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Error: {}", self.error)
    }
}


