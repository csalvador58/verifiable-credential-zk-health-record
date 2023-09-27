use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Patient {
    resourceType: ResourceType,
    meta: Meta,
    name: Vec<Name>,
    telecom: Vec<Telecom>,
    id: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Name {
    given: Vec<String>,
    family: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Telecom {
    system: String,
    r#use: String,
    value: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Meta {
    project: String,
    versionId: String,
    lastUpdated: String,
    author: Author,
    #[serde(default)]
    compartment: Option<Vec<Compartment>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct Author {
    reference: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct Compartment {
    reference: String,
}

