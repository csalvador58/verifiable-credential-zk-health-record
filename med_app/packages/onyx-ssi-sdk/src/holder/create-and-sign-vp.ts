import {
  EthrDIDMethod,
  KeyDIDMethod,
  createAndSignPresentationJWT,
  getSubjectFromVP,
} from "@jpmorganchase/onyx-ssi-sdk";
import fs from "fs";
import { camelCase, includes } from "lodash";
import path from "path";
import {
  HOLDER_EDDSA_PRIVATE_KEY,
  HOLDER_ES256K_PRIVATE_KEY,
  VC,
  VC_DIR_PATH,
  VP_DIR_PATH,
  ethrProvider,
} from "../../config";
import { privateKeyBufferFromString } from "../utils/convertions";
import { writeToFile } from "../utils/writer";

export const createAndSignVp = async (signedVcJwt: any, zkProofOfFhirResource: any) => {

  if (signedVcJwt && zkProofOfFhirResource) {
    try {
      // console.log("\nReading an existing signed VC JWT\n");
      // const signedVcJwt = fs.readFileSync(
      //   path.resolve(VC_DIR_PATH, `${camelCase(VC)}.jwt`),
      //   "utf8"
      // );
      // console.log(signedVcJwt);

      console.log("\nGeting User from VC\n");
      const holderDid = getSubjectFromVP(signedVcJwt);
      console.log(holderDid);

      if (includes(holderDid, "ethr")) {
        console.log("VC did method: did:ethr");

        const didEthr = new EthrDIDMethod(ethrProvider);
        const didWithKeys = await didEthr.generateFromPrivateKey(
          HOLDER_ES256K_PRIVATE_KEY
        );

        if (didWithKeys.did === holderDid) {
          console.log("\nCreating and signing the VP from VC\n");
          const signedVp = await createAndSignPresentationJWT(didWithKeys, [
            signedVcJwt,
          ]);
          console.log(signedVp);

          writeToFile(
            path.resolve(VP_DIR_PATH, `${VC}.jwt`),
            JSON.stringify(signedVp)
          );
        } else {
          console.log(
            "HOLDER_ES256K_PRIVATE_KEY cannot sign for this verifiable credentail\n"
          );
        }
      } else if (includes(holderDid, "key")) {
        console.log("\nVC did method: did:key\n");

        const didKey = new KeyDIDMethod();
        const didWithKeys = await didKey.generateFromPrivateKey(
          privateKeyBufferFromString(HOLDER_EDDSA_PRIVATE_KEY)
        );

        if (didWithKeys.did === holderDid) {
          console.log("\nCreating and signing the VP from VC\n");
          const signedVp = await createAndSignPresentationJWT(didWithKeys, [
            signedVcJwt,
          ]);
          console.log(signedVp);

          writeToFile(path.resolve(VP_DIR_PATH, `${VC}.jwt`), signedVp);
        } else {
          console.log(
            "\nHOLDER_EDDSA_PRIVATE_KEY cannot sign for this verifiable credentail\n"
          );
        }
      }
    } catch (err) {
      console.log("\nFailed to fetch file\n");
      console.log(
        "\nTo run this script you must have a valid VC and a valid signed VC JWT\n"
      );
      console.log(
        "\nPlease refer to issuer scripts to generate and sign a VC\n"
      );
    }
  } else {
    console.log("\nVC not found!\n");
    console.log(
      "\nTo run this script you must have a valid VC and a valid signed VC JWT\n"
    );
    console.log("\nPlease refer to issuer scripts to generate and sign a VC\n");
  }
};

// createAndSignVp();


// {
//   "exp": 1727756212,
//   "vc": {
//     "@context": [
//       "https://www.w3.org/2018/credentials/v1"
//     ],
//     "type": [
//       "VerifiableCredential",
//       "MedicationRequest"
//     ],
//     "credentialSubject": {
//       "fhir": {
//         "id": "ee627f8d-7c5f-4b2a-9d9a-dbe25f516e5f",
//         "meta": {
//           "profile": [
//             "http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest"
//           ],
//           "versionId": "648a89c3-4e09-4d07-ae0d-761019319bd9",
//           "lastUpdated": "2023-09-25T01:55:15.760Z",
//           "author": {
//             "reference": "Practitioner/35735281-469a-4024-999e-b8dfeb6ce788",
//             "display": "Chris Salvador"
//           },
//           "project": "ef3aae15-28ca-4585-a6fd-43382424181c",
//           "compartment": [
//             {
//               "reference": "Project/ef3aae15-28ca-4585-a6fd-43382424181c"
//             },
//             {
//               "reference": "Patient/2d5641ce-474e-4c66-896d-36a37de211eb"
//             }
//           ]
//         },
//         "status": "active",
//         "intent": "order",
//         "medicationCodeableConcept": {
//           "coding": [
//             {
//               "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
//               "code": "313782",
//               "display": "Acetaminophen 325 MG Oral Tablet"
//             }
//           ],
//           "text": "Acetaminophen 325 MG Oral Tablet"
//         },
//         "subject": {
//           "reference": "Patient/2d5641ce-474e-4c66-896d-36a37de211eb"
//         },
//         "encounter": {
//           "reference": "Encounter/085d1cdd-c0c4-4427-a91a-812e1a5875e5"
//         },
//         "authoredOn": "2023-09-22T22:53:18.000Z",
//         "requester": {
//           "reference": "Practitioner/076541d6-51f5-4a37-88e7-1fd06c640223",
//           "display": "Dr. Patricia625 Kilback373"
//         },
//         "reasonReference": [
//           {
//             "reference": "Condition/e9dce52e-329b-4478-b65d-af42d4d202f2"
//           }
//         ],
//         "resourceType": "MedicationRequest"
//       }
//     },
//     "credentialSchema": {
//       "id": "http://json-schema.org/draft-06/schema#",
//       "type": "JsonSchemaValidator2018"
//     }
//   },
//   "sub": "did:key:z6MkumBwH3GvsrmMgsdLBd28B945zieEnvuoAcTG7PTrxCgb",
//   "jti": "did:key:z6MkgDUL8tDF176WphbxJhRfA4oEZYx1FDdUBhjjeNr1qUxu",
//   "nbf": 1696133815,
//   "iss": "did:key:z6MktP8VMpTjshkdQfq3ZA4m9h1cTJ6KXLfeBXYntMBp7F21"
// }