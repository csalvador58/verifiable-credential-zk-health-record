import express, { Request, Response, NextFunction, Express } from 'express';
import { createVc } from '../issuer/create-and-sign-vc_with_schema_params';
import { createAndSignVp } from '../holder/create-and-sign-vp';
import cors from 'cors';

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
  console.log(`Server running on http://localhost${port}`);
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
  const { issuerSignedVerifiableCredential, fhirHealthRecord } = req.body;

  // Fetch zk proof from zkvm
  try {
    const url = `http://127.0.0.1:8080/zkp/create-medication-request`;
    const method = 'POST';
    const zkReceipt = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fhirHealthRecord),
    }).then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const zkProof = await response.json();

      const signedVp = await createAndSignVp(zkProof, issuerSignedVerifiableCredential);
      res.send({ message: signedVp });
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});

export default app;

// app.post('/create-signed-vc', async (req: Request, res: Response, next: NextFunction) => {
//   const fhirResource = req.body;

//   // Fetch zk proof from zkvm
//   // Fetch signed VC from issuer
//   console.log('fhirResource', fhirResource);

//   try {
//     const url = `http://127.0.0.1:8080/zkp/create-medication-request`;
//     const method = 'POST';
//     const zkReceipt = await fetch(url, {
//       method: method,
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(fhirResource),
//     }).then(async (response) => {
//       if (!response.ok) {
//         throw new Error(response.statusText);
//       }

//       const data = await response.json();
//       const vc = await createVc(data);
//       res.send({ message: vc });
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Internal server error' });
//   }
//   res.send({ message: 'test' });
// });
