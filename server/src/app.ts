import express, { Request, Response, NextFunction, Express } from 'express';
import routes from './routes/index.js';

const app: Express = express();
app.use(express.json());

app.use(routes);

app.get('/', (_req: Request, res: Response, _next: NextFunction) => {
  res.send(`
        <html>
            <body>
                <h1>Server deployed!</h1>
            </body>
        </html>
    `);
});

export default app;
