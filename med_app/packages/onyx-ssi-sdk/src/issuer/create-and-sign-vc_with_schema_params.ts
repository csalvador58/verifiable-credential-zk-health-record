import {
  createCredentialFromSchema,
  DIDWithKeys,
  KeyDIDMethod,
  JWTService,
  SchemaManager,
} from '@jpmorganchase/onyx-ssi-sdk';
import { camelCase } from 'lodash';
import path from 'path';
import { HOLDER_EDDSA_PRIVATE_KEY, ISSUER_EDDSA_PRIVATE_KEY, VC_SCHEMA_URL } from '../../config';
import { privateKeyBufferFromString } from '../utils/convertions';

const jwtService = new JWTService();
const signVc = async (issuerDidWithKeys: DIDWithKeys, vc: any) => {
  return jwtService.signVC(issuerDidWithKeys, vc);
};

export const createVc = async (fhirResource: any) => {
  const didKey = new KeyDIDMethod();

  const issuerDidWithKeys = await didKey.generateFromPrivateKey(privateKeyBufferFromString(ISSUER_EDDSA_PRIVATE_KEY));

  const holderDidWithKeys = await didKey.generateFromPrivateKey(privateKeyBufferFromString(HOLDER_EDDSA_PRIVATE_KEY));

  const vcDidKey = (await didKey.create()).did;

  // const credentialType = "PROOF_OF_ADDRESS";
  const credentialType = fhirResource.resourceType;

  const subjectData = {
    ...fhirResource,
  };

  //Setting an expiration data parameter for the VC
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(new Date().getFullYear() + 1);

  const expirationDate = oneYearFromNow.toISOString();

  const additionalParams = {
    id: vcDidKey,
    expirationDate: expirationDate,
  };

  //Schema validation
  const proofOfNameSchema = await SchemaManager.getSchemaFromFile(
    path.resolve(`${__dirname}/schemas/fhir.schema.json`)
  );

  const validation: any = await SchemaManager.validateCredentialSubject(subjectData, proofOfNameSchema);

  if (validation) {
    console.log(`\nGenerating Verifiable Credential of type ${credentialType}\n`);

    const vc = await createCredentialFromSchema(
      VC_SCHEMA_URL!,
      issuerDidWithKeys.did,
      holderDidWithKeys.did,
      subjectData,
      credentialType,
      additionalParams
    );

    console.log(JSON.stringify(vc, null, 2));

    console.log(`\nGenerating a signed verifiable Credential of type ${credentialType}\n`);

    console.log('\nSigning the VC\n');
    const signedVc = await signVc(issuerDidWithKeys, vc);
    console.log(signedVc);

    return signedVc;
  } else {
    console.log('Schema Validation failed');
  }
};
