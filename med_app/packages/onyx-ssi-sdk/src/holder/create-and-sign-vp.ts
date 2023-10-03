import {
  EthrDIDMethod,
  JWTService,
  KeyDIDMethod,
  createAndSignPresentationJWT,
  getSubjectFromVP,
} from '@jpmorganchase/onyx-ssi-sdk';
import fs from 'fs';
import { camelCase, includes } from 'lodash';
import path from 'path';
import {
  HOLDER_EDDSA_PRIVATE_KEY,
  HOLDER_ES256K_PRIVATE_KEY,
  VC,
  VC_DIR_PATH,
  VP_DIR_PATH,
  ethrProvider,
} from '../../config';
import { privateKeyBufferFromString } from '../utils/convertions';
import { writeToFile } from '../utils/writer';

export const createAndSignVp = async (signedVCJwt: string) => {
  console.log('\nCreating and signing the VP from VC\n');
  console.log(signedVCJwt);

  if (!!signedVCJwt) {
    try {
      // console.log("\nReading an existing signed VC JWT\n");
      // const signedVcJwt = fs.readFileSync(
      //   path.resolve(VC_DIR_PATH, `${camelCase(VC)}.jwt`),
      //   "utf8"
      // );
      // console.log(signedVcJwt);

      console.log('\nGeting User from VC\n');
      const holderDid = getSubjectFromVP(signedVCJwt);
      console.log(holderDid);

      if (includes(holderDid, 'ethr')) {
        console.log('VC did method: did:ethr');

        const didEthr = new EthrDIDMethod(ethrProvider);
        const didWithKeys = await didEthr.generateFromPrivateKey(HOLDER_ES256K_PRIVATE_KEY);

        if (didWithKeys.did === holderDid) {
          console.log('\nCreating and signing the VP from VC\n');
          const signedVp = await createAndSignPresentationJWT(didWithKeys, [signedVCJwt]);
          console.log(signedVp);

          writeToFile(path.resolve(VP_DIR_PATH, `${VC}.jwt`), JSON.stringify(signedVp));
        } else {
          console.log('HOLDER_ES256K_PRIVATE_KEY cannot sign for this verifiable credentail\n');
        }
      } else if (includes(holderDid, 'key')) {
        console.log('\nVC did method: did:key\n');

        const didKey = new KeyDIDMethod();
        const didWithKeys = await didKey.generateFromPrivateKey(privateKeyBufferFromString(HOLDER_EDDSA_PRIVATE_KEY));

        if (didWithKeys.did === holderDid) {
          console.log('\nCreating and signing the VP from VC\n');
          const signedVp = await createAndSignPresentationJWT(didWithKeys, [signedVCJwt]);
          console.log(signedVp);

          // writeToFile(path.resolve(VP_DIR_PATH, `${VC}.jwt`), signedVp);

          const {id, type} = getVerifiableCredentialID(signedVCJwt);
          writeToVCStore(
            path.resolve(VP_DIR_PATH, `${camelCase(type)}_vp.json`),
            JSON.stringify({ id, vp_signed: signedVp, date_signed: new Date().toLocaleString()}, null, 2)
          );
        } else {
          console.log('\nHOLDER_EDDSA_PRIVATE_KEY cannot sign for this verifiable credentail\n');
        }
      }
    } catch (err) {
      console.log('\nFailed to fetch file\n');
      console.log('\nTo run this script you must have a valid VC and a valid signed VC JWT\n');
      console.log('\nPlease refer to issuer scripts to generate and sign a VC\n');
    }
  } else {
    console.log('\nVC not found!\n');
    console.log('\nTo run this script you must have a valid VC and a valid signed VC JWT\n');
    console.log('\nPlease refer to issuer scripts to generate and sign a VC\n');
  }
};

// createAndSignVp();
export const getVerifiableCredentialID = (vc: any) => {
  const jwtService = new JWTService();
  if (typeof vc === 'string') {
    const credential = jwtService.decodeJWT(vc)?.payload;
    console.log('credential')
    console.log(credential)
    return {id: credential.jti, type: credential.vc.credentialSubject.resourceType} ;
  } else {
    return vc.credentialSubject.id;
  }
};

export const writeToVCStore = (fileLocationPath: string, content: string) => {
  try {
    // Read the existing JSON data from the file (if it exists)
    let existingData = [];
    if (fs.existsSync(fileLocationPath)) {
      const fileContent = fs.readFileSync(fileLocationPath, 'utf8');
      existingData = JSON.parse(fileContent);
    }

    // Append the new data to the existing data array
    const newData = JSON.parse(content);
    existingData.push(newData);

    // Write the updated data back to the file
    fs.writeFileSync(fileLocationPath, JSON.stringify(existingData, null, 2));

    console.log(`\nData appended to the file under ${path.dirname(fileLocationPath)} directory\n`);
  } catch (error) {
    console.log('Failed to write file');
    console.error(error);
  }
};
