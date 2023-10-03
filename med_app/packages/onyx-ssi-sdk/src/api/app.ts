import express, { Request, Response, NextFunction, Express } from 'express';
import { createVc } from '../issuer/create-and-sign-vc_with_schema_params';
import { createAndSignVp } from '../holder/create-and-sign-vp';
import cors from 'cors';
import { uploadMetadata } from './uploadMetadata';

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

  const DIDkey = req.body.did;
  const description =
    'Token presents proof of DID creation by HMS Verifiable Credentials. The token is non-transferable and is not redeemable for monetary or fiat currency.';
  const external_url = 'https://w3c-ccg.github.io/did-method-key/';
  const imageCID = 'ipfs://QmYNR56MRPf2Vc1NBuSSG95Bf4sTNarkfFhQGc7tC4qCk7';

  try {
    const metadataCID = await uploadMetadata({ DIDkey, description, external_url, imageCID });
    res.send({ message: metadataCID });
  } catch (error) {
    console.log(error);
  }
});

export default app;