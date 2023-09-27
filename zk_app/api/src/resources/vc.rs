use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct VerifiableCredential {
    boolean_field: bool,
    data: String,
    obj_field: ObjectField,
}

#[derive(Serialize, Deserialize, Debug)]
struct ObjectField {
    string_subfield: Vec<String>,
}