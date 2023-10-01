use risc0_zkvm::sha::Digest;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, Eq, PartialEq)]
pub struct Outputs {
    pub requester: Vec<u8>,
    pub authoredOn: Vec<u8>,
    pub status: Vec<u8>,
    pub subject: Vec<u8>,
    pub medicationCodeableConcept: Vec<u8>,
    pub resourceType: Vec<u8>,
    pub hash: Digest,
}
