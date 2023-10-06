import {
  EthrDIDMethod,
  JWTService,
  KeyDIDMethod,
  getCredentialsFromVP,
  getSupportedResolvers,
  verifyDIDs,
  verifyPresentationJWT,
} from "@jpmorganchase/onyx-ssi-sdk";
import fs from "fs";
import { camelCase } from "lodash";
import path from "path";
import { VP, VP_DIR_PATH, ethrProvider } from "../../config";

const didKey = new KeyDIDMethod();
const didEthr = new EthrDIDMethod(ethrProvider);
const jwtService = new JWTService();

export const verification = async (verifiablePresentationToken: string) => {
  // Instantiating the didResolver
  const didResolver = getSupportedResolvers([didKey, didEthr]);
  // const didResolver = getSupportedResolvers([didKey]);
  console.log("didResolver", didResolver)

  if (verifiablePresentationToken) {
    try {
      console.log("\nReading an existing signed VP JWT\n");
      // const signedVpJwt = fs.readFileSync(
      //   path.resolve(VP_DIR_PATH, `${camelCase(VP)}.jwt`),
      //   "utf8"
      // );
      console.log(verifiablePresentationToken);

      console.log("\nVerifying VP JWT\n");
      // Inovking the verification fuction from the sdk
      // To know more about verification and api reference please refer to readme in src > verifier > readme.md in the sdk
      const isVpJwtValid = await verifyPresentationJWT(
        verifiablePresentationToken,
        didResolver
      );

      if (isVpJwtValid) {
        console.log("\nVP JWT is Valid\n");

        console.log("\nGetting VC JWT from VP\n");

        const vcJwt = getCredentialsFromVP(verifiablePresentationToken)[0];
        console.log('vcJwt');
        console.log(vcJwt);

        try {
          console.log("\nVerifying VC\n");

          const vcVerified = await verifyDIDs(vcJwt, didResolver);
          console.log(`\nVerification status: ${vcVerified}\n`);
          return { status: vcVerified, vc: vcJwt};
        } catch (error) {
          console.log(error);
        }
      } else {
        console.log("Invalid VP JWT");
      }
    } catch (err) {
      console.log("\nFailed to fetch file\n");
      console.log(
        "\nTo run this script you must have a valid VP and a valid signed VP JWT\n"
      );
      console.log(
        "\nPlease refer to issuer scripts to generate and sign a VP\n"
      );
    }
  } else {
    console.log("\nVP not found!\n");
    console.log(
      "\nTo run this script you must have a valid VP and a valid signed VP JWT\n"
    );
    console.log("\nPlease refer to issuer scripts to generate and sign a VP\n");
  }
};
