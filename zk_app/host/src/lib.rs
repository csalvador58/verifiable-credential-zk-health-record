use json_core::Outputs;
use risc0_zkvm::{
    default_prover,
    serde::{from_slice, to_vec},
    ExecutorEnv,
};
use zk_methods::{VALIDATE_ELF, VALIDATE_ID};

pub fn zkvm_host(verifiable_credential: &str) -> Outputs {
    // Read the VC from a file
    // let vc_data = include_str!("../../vc/verifiable_cred.json");

    // Perform validation on verifiable credential
    let zkp_receipt: Outputs = vc_search_json(verifiable_credential);

    // Display receipt from journal
    println!("\n\nReceipt:\n");
    println!("Hash: {:?}\n", zkp_receipt.hash);
    println!(
        "Data {:?}",
        String::from_utf8(zkp_receipt.verifiable_data_1.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(zkp_receipt.verifiable_data_2.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(zkp_receipt.verifiable_data_3.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(zkp_receipt.verifiable_data_4.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(zkp_receipt.verifiable_data_5.clone()).unwrap()
    );

    // Return receipt
    zkp_receipt
}

fn vc_search_json(vc: &str) -> Outputs {
    // Construct an executor environment with the VC as input
    let env = ExecutorEnv::builder()
        .add_input(&to_vec(&vc).unwrap()) // serialize the VC
        .build()
        .unwrap();

    // Create a prover instance.
    let prover = default_prover();

    // Run the guest code and prove the specified ELF binary and generate a receipt
    // Generate a receipt containing the journal, proven outputs, proof of compute
    // No other data from the verifiable credential is included
    let receipt = prover.prove_elf(env, VALIDATE_ELF).expect("Prover failed");

    // Verify the receipt / zk proof
    // VALIDATE_ID is the hash of the validate method
    receipt.verify(VALIDATE_ID).expect("Receipt verification failed");
    println!("\nReceipt verified successfully");

    // Deserialize and return the public output and hash of the guest program
    from_slice(&receipt.journal).expect("Failed to deserialize receipt")
}
