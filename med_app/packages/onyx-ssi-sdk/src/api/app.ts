import express, { Request, Response, NextFunction, Express } from 'express';
import { createVc } from '../issuer/create-and-sign-vc_with_schema_params';
import { createAndSignVp } from '../holder/create-and-sign-vp';
import cors from 'cors';
import { uploadMetadata } from './uploadMetadata';
import { verification } from '../verifier/verify';
import { decodeJWT } from 'did-jwt';

const app: Express = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const port = 3001;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`
  ${req.method} ${req.url}
  Headers: ${req.headers.authorization}
  Body: ${JSON.stringify(req.body)}
  at ${new Date()}`);
  next();
});

app.post('/create-signed-vc', async (req: Request, res: Response, next: NextFunction) => {
  const fhirHealthRecord = req.body;

  console.log('fhirHealthRecord', fhirHealthRecord.fhir);

  // Fetch zk proof from zkvm
  try {
    const url = `http://127.0.0.1:8080/zkp/create-medication-request`;
    const method = 'POST';
    const zkReceipt = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fhirHealthRecord.fhir),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const zkProof = await response.json();

      console.log('zkProof', zkProof);

      const signedVC = await createVc(zkProof, fhirHealthRecord.fhir.resourceType);
      res.send({ message: signedVC });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

app.post('/create-signed-vp', async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.vc) {
    res.status(400).send({ message: 'No VC provided' });
  }
  const verifiableCredential = req.body.vc;

  const signedVp = await createAndSignVp(verifiableCredential);
  res.send({ message: signedVp });
});

app.post('/generate-cid', async (req: Request, res: Response, next: NextFunction) => {
  if (!req.body.did) {
    res.status(400).send({ message: 'No DID provided' });
  }

  const DIDkey = req.body.did as string;
  console.log('DIDkey from ony api', DIDkey);
  const description =
    'Receipt for Verifiable Credentials linked to DID:key. Non-transferable, non-redeemable for fiat.';
  const external_url = 'https://w3c-ccg.github.io/did-method-key/';
  // const imageCID = 'ipfs://QmYNR56MRPf2Vc1NBuSSG95Bf4sTNarkfFhQGc7tC4qCk7';
  const imageCID = 'test';

  try {
    const metadataCID = await uploadMetadata({ DIDkey, description, external_url, imageCID });
    res.send({ message: metadataCID });
  } catch (error) {
    console.log(error);
  }
});

interface IVerifyRequest extends Request {
  body: {
    vp: string;
  };
}

app.post('/verify', async (req: IVerifyRequest, res: Response) => {
  try {
    if (!req.body.vp) {
      return res.status(400).send({ message: 'No Verifiable Presentation provided to verify' });
    }
    console.log('req.body.vp', req.body.vp);

    const result = await verification(req.body.vp);
    if (result) {
      return res.status(200).send({ message: result });
    } else {
      return res.status(400).send({ message: result });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

app.post('/verify-zkp', async (req: Request, res: Response) => {
  try {
    if (!req.body.vc) {
      return res.status(400).send({ message: 'No ZK Proof provided to verify' });
    }
    const { vc } = req.body;
    console.log('vc', vc);

    const decodedVc = await decodeJWT(vc as string);
    console.log('decodedVc', decodedVc);
    console.log('cred sub', decodedVc.payload.vc.credentialSubject);

    const imageID: number[] = decodedVc.payload.vc.credentialSubject.image_id;
    console.log({ image: imageID });

    const url = `http://127.0.0.1:8080/zkp/verify`;
    const method = 'POST';
    const zkReceipt = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageID }), 
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const zkProof = await response.json();

      console.log('zkProof', zkProof);

      res.send({ message: zkProof });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'Internal server error' });
  }
});

export default app;
