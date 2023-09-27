use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Serialize, Deserialize, Debug)]
pub struct Patient {
    resourceType: String,
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

impl fmt::Display for Patient {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // Use format! macro to build the string representation
        let formatted = format!("Patient: {:?} ({:?})", self.name, self.id);

        // Write the formatted string to the formatter
        write!(f, "{}", formatted)
    }
}

impl fmt::Display for Name {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // Format the name as you desire, e.g., concatenate given names and family name
        let full_name = format!("{} {}", self.given.join(" "), self.family);

        // Write the formatted full name to the formatter
        write!(f, "{}", full_name)
    }
}
