use risc0_zkvm::sha::Digest;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize, Eq, PartialEq)]
pub struct Outputs {
    pub verifiable_data_1: Vec<u8>,
    pub verifiable_data_2: Vec<u8>,
    pub verifiable_data_3: Vec<u8>,
    pub verifiable_data_4: Vec<u8>,
    pub verifiable_data_5: Vec<u8>,
    pub verifiable_data_6: Vec<u8>,
    pub hash: Digest,
}
