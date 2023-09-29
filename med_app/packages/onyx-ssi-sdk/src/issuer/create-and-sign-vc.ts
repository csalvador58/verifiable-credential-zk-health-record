import { KeyDIDMethod, createAndSignCredentialJWT } from "@jpmorganchase/onyx-ssi-sdk";
import { camelCase } from "lodash";
import path from "path";
import {
  HOLDER_EDDSA_PRIVATE_KEY,
  ISSUER_EDDSA_PRIVATE_KEY,
  VC_DIR_PATH,
} from "../../config";
import { privateKeyBufferFromString } from "../utils/convertions";
import { writeToFile } from "../utils/writer";

export const createVc = async (fhirResource: any) => {
  const didKey = new KeyDIDMethod();

  const issuerDidWithKeys = await didKey.generateFromPrivateKey(
    privateKeyBufferFromString(ISSUER_EDDSA_PRIVATE_KEY)
  );

  const holderDidWithKeys = await didKey.generateFromPrivateKey(
    privateKeyBufferFromString(HOLDER_EDDSA_PRIVATE_KEY)
  );

  const vcDidKey = (await didKey.create()).did;

  // const credentialType = "PROOF_OF_ADDRESS";
  const credentialType = fhirResource.resourceType;

  const subjectData = {
    ...fhirResource,
  };
  // const subjectData = {
  //   name: "Jessie Doe",
  //   address: "1234 Mockingbird Lane",
  //   city: "Anytown",
  //   state: "Anystate",
  //   country: "USA",
  //   zip: "012345",
  // };

  //vc id, expirationDate, credentialStatus, credentialSchema, etc
  const additionalParams = {
    id: vcDidKey,
  };

  console.log(
    `\nGenerating a signed verifiable Credential of type ${credentialType}\n`
  );

  const signedVc = await createAndSignCredentialJWT(
    issuerDidWithKeys,
    holderDidWithKeys.did,
    subjectData,
    [credentialType],
    additionalParams
  );

  console.log(signedVc);

  // console.log("\nSaving signed VC JWT\n");
  // writeToFile(
  //   path.resolve(VC_DIR_PATH, `${camelCase(credentialType)}.jwt`),
  //   signedVc
  // );
  return signedVc;
};