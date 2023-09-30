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
    
    // Hash the verifiable credential
    let sha_verifiable_credential: risc0_zkvm::sha::Digest = *Impl::hash_bytes(&verifiable_credential.as_bytes());
    //
    let verifiable_credential: json::JsonValue = parse(&verifiable_credential).unwrap();

    // Validate the verifiable credential
    let field_to_validate_1: &str = "requester";
    let field_to_validate_2: &str = "authoredOn";
    let field_to_validate_3: &str = "status";
    let field_to_validate_4: &str = "subject";
    let field_to_validate_5: &str = "medicationCodeableConcept";
    let proven_value_1: Vec<u8> = verifiable_credential[field_to_validate_1].to_string().as_bytes().to_vec();
    let proven_value_2: Vec<u8> = verifiable_credential[field_to_validate_2].to_string().as_bytes().to_vec();
    let proven_value_3: Vec<u8> = verifiable_credential[field_to_validate_3].to_string().as_bytes().to_vec();
    let proven_value_4: Vec<u8> = verifiable_credential[field_to_validate_4].to_string().as_bytes().to_vec();
    let proven_value_5: Vec<u8> = verifiable_credential[field_to_validate_5].to_string().as_bytes().to_vec();
    
    let output = Outputs {
        verifiable_data_1: proven_value_1,
        verifiable_data_2: proven_value_2,
        verifiable_data_3: proven_value_3,
        verifiable_data_4: proven_value_4,
        verifiable_data_5: proven_value_5,
        hash: sha_verifiable_credential,
    };
    
    // Commit/Write the output to a receipt
    // Receipt only contains proof of computed code and proven value,
    // no other data from the verifiable credential is included
    env::commit(&output);
}
