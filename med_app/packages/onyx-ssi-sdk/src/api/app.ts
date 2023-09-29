import express, { Request, Response, NextFunction, Express } from 'express';
import { createVc } from '../issuer/create-and-sign-vc_with_schema_params';
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
  const fhirResource = req.body;
  const vc = await createVc(fhirResource);
  res.send({ message: vc });
});

export default app;
