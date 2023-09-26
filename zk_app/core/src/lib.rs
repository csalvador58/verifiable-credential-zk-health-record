use risc0_zkvm::sha::Digest;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, Eq, PartialEq)]
pub struct Outputs {
    pub verifiable_data: Vec<u8>,
    pub hash: Digest,
}