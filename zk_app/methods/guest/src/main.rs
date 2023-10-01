#![no_main]

use json::parse;
use json_core::Outputs;
use risc0_zkvm::{
    guest::env,
    sha::{Impl, Sha256}
};

risc0_zkvm::guest::entry!(main);


pub fn main() {
    // Guest-side code implementation that is ran in RISC Zero's zkVM

    // Privately load the verifiable credential from the host
    let verifiable_credential: String = env::read();
    
    // Hash the verifiable credential using SHA-256
    let sha_verifiable_credential: risc0_zkvm::sha::Digest = *Impl::hash_bytes(&verifiable_credential.as_bytes());
    // Parse the verifiable credential into a JSON object
    let verifiable_credential: json::JsonValue = parse(&verifiable_credential).unwrap();

    // Validate the verifiable credential fields exists and make public
    let field_to_validate_1: &str = "requester";
    let field_to_validate_2: &str = "authoredOn";
    let field_to_validate_3: &str = "status";
    let field_to_validate_4: &str = "subject";
    let field_to_validate_5: &str = "medicationCodeableConcept";
    let field_to_validate_6: &str = "resourceType";

    let value_1: Vec<u8> = verifiable_credential[field_to_validate_1].to_string().as_bytes().to_vec();
    let value_2: Vec<u8> = verifiable_credential[field_to_validate_2].to_string().as_bytes().to_vec();
    let value_3: Vec<u8> = verifiable_credential[field_to_validate_3].to_string().as_bytes().to_vec();
    let value_4: Vec<u8> = verifiable_credential[field_to_validate_4].to_string().as_bytes().to_vec();
    let value_5: Vec<u8> = verifiable_credential[field_to_validate_5].to_string().as_bytes().to_vec();
    let value_6: Vec<u8> = verifiable_credential[field_to_validate_6].to_string().as_bytes().to_vec();
    
    let output = Outputs {
        requester: value_1,
        authoredOn: value_2,
        status: value_3,
        subject: value_4,
        medicationCodeableConcept: value_5,
        resourceType: value_6,
        hash: sha_verifiable_credential,
    };
    
    // Commit/Write the output to a receipt
    // Receipt will contain proof of computed code and output values,
    // no other data from the verifiable credential is included
    env::commit(&output);
}
