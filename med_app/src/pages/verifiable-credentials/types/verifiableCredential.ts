export interface IIssuedVerifiableCredential {
  id: string;
  vc_signed: string;
  vc_raw: IVerifiableCredential;
}

export interface IVerifiableCredential {
  '@context': string[];
  id: string;
  credentialSubject: IZKProof;
  issuer: {
    id: string;
  }
  type: string[];
  issuanceDate: string;
  credentialSchema: {
    id: string;
    type: string;
  };
  expirationDate: string;
}

export interface IZKProof {
  id: string;
  hash: string;
  requester: string;
  authoredOn: string;
  status: string;
  subject: string;
  medicationCodeableConcept: string;
  resourceType: string;
  image_id: number[];
}
