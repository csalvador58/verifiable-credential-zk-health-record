/*
crate
 └── backend
     ├── api
     │   ├── get
     │   │   ├── biconomy_login
     │   │   ├── DID_by_id
     │   │   ├── all_DIDs
     │   │   └── verify_vp
     │   ├── post
     │   │   ├── new_vp
     │   │   └── new_did
     │   ├── put
     │   │   └── update_did
     │   └── delete
     │       └── remove_did
     └── onyx
     │   ├── create_did
     │   └── validate_did
     └── zk
         ├── create_zkp
         └── validate_zkp

*/

pub use backend::api::*;
pub use backend::onyx::*;
pub use backend::zk::*;

pub mod backend {
    pub mod api {

        // api for multi users

        pub fn get_biconomy_login() {
            // receive smart account address
            todo!();
        }

        pub fn get_DID_by_id() {
            // return DID by id associated with smart account
            todo!();
        }

        pub fn get_all_DIDs() {
            // return all DIDs by id associated with smart account
            todo!();
        }

        // vendor api
        pub fn post_new_vp() {
            // create a vp
            // onyx::create_sign_vp();

            // store in db
            todo!();

            // return status
            todo!();
        }

        // HCP issuer api
        pub fn post_new_DID() {
            // create did
            // onyx::create_did();

            // return status
            todo!();
        }

        pub fn put_update_DID() {
              // update did
            //   onyx::update_did();

              // return status
              todo!();
        }

        pub fn delete_DID() {
              // cancel did
            //   onyx::cancel_did();

              // return status
              todo!();
        }

        // Verifier api
        pub fn get_verify_vcp() {
            // validate vp
            // onyx::validate_vp();

            // return status
            todo!();
        } 

    }

    pub mod onyx {

        pub fn create_did() {
            // create did
            todo!();
        }
        pub fn update_did() {
            // update did
            todo!();
        }
        pub fn cancel_did() {
            // cancel did
            todo!();
        }
        pub fn create_sign_vp() {
            // create zkp for data field
            // zk::create_zkp();

            // return signed vp
            todo!();
        }
        pub fn validate_vp() {
            // validate zkp
            // zk::validate_zkp();

            // return status
            todo!();
        }
    }

    pub mod zk {
        pub fn create_zkp() {
            // return zkp
            todo!();
        }
        pub fn validate_zkp() {
            // validate zkp
            todo!();
        }
    }
}
