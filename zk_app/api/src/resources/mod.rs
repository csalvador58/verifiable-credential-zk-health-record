pub mod patient;
pub mod vc;
pub mod medication_request;
pub mod image;

pub use patient::Patient;
pub use vc::VerifiableCredential;
pub use vc::ObjectField;
pub use medication_request::MedicationRequest;
pub use medication_request::Meta;
pub use medication_request::Author;
pub use medication_request::Compartment;
pub use medication_request::MedicationCodeableConcept;
pub use medication_request::Coding;
pub use medication_request::Subject;
pub use medication_request::Encounter;
pub use medication_request::Requester;
pub use medication_request::ReasonReference;
pub use image::ImageId;

