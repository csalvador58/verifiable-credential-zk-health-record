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

    // TODO: Update field_to_validate to be a parameter 
    let field_to_validate: &str = "data";
    let proven_value: Vec<u8> = verifiable_credential[field_to_validate].to_string().as_bytes().to_vec();

    let output = Outputs {
        verifiable_data: proven_value,
        hash: sha_verifiable_credential,
    };
    
    // Commit/Write the output to a receipt
    // Receipt only contains proof of computed code and proven value,
    // no other data from the verifiable credential is included
    env::commit(&output);
}
