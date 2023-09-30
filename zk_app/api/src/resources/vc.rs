use serde::{Deserialize, Serialize};
use std::fmt::Display;

use actix_web::{
    body::BoxBody,
    http::{header::ContentType, StatusCode},
    HttpRequest, HttpResponse, Responder, ResponseError,
};
use std::sync::Mutex;

#[derive(Serialize, Deserialize)]
pub struct VerifiableCredential {
    pub boolean_field: bool,
    pub data: String,
    pub obj_field: ObjectField,
}

#[derive(Serialize, Deserialize)]
pub struct ObjectField {
    pub string_subfield: String,
    pub array_subfield: Vec<String>,
}

impl Responder for VerifiableCredential {
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
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}
