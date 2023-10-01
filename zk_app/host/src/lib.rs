use json_core::Outputs;
use risc0_zkvm::{
    default_prover,
    serde::{from_slice, to_vec},
    ExecutorEnv, Receipt,
};
use zk_methods::{VALIDATE_ELF, VALIDATE_ID};

pub fn zkvm_host(verifiable_credential: &str) -> Receipt {
    // Read the VC from a file
    // let vc_data = include_str!("../../vc/verifiable_cred.json");

    // Perform validation on verifiable credential
    let receipt: Receipt = vc_search_json(verifiable_credential);

    // Optional verification of receipt. Receipt can be provided to a verifier.
    // VALIDATE_ID is the hash of the proving code
    receipt.verify(VALIDATE_ID).expect("Receipt verification failed");
    println!("\nReceipt verified successfully");

    //  Deserialize receipt
    let output: Outputs = from_slice(&receipt.journal).expect("Failed to deserialize receipt");

    // Display outputs of journal from receipt
    println!("\n\nReceipt:\n");
    println!("Hash: {:?}\n", output.hash);
    println!(
        "Data {:?}",
        String::from_utf8(output.requester.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(output.authoredOn.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(output.status.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(output.subject.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(output.medicationCodeableConcept.clone()).unwrap()
    );
    println!(
        "Data {:?}",
        String::from_utf8(output.resourceType.clone()).unwrap()
    );

    // Return receipt
    receipt
}

fn vc_search_json(vc: &str) -> Receipt {
    // Construct an executor environment with the VC as input
    let env = ExecutorEnv::builder()
        .add_input(&to_vec(&vc).unwrap()) // serialize the VC
        .build()
        .unwrap();

    // Create a prover instance.
    let prover = default_prover();

    // Run the guest code and prove the specified ELF binary and generate a receipt.
    // Generate a receipt containing the journal, proven outputs, proof of compute.
    // No other data from the verifiable credential is included.
    let receipt = prover.prove_elf(env, VALIDATE_ELF).expect("Prover failed");

    receipt
}
