import { Request, Response, NextFunction, Router } from 'express';

const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
    // Convert Date.now() to a string in the format: YYYY-MM-DD HH:MM:SS.MMM
    // https://stackoverflow.com/a/30272803

    console.log(`
        Time: ${new Date(Date.now()).toISOString().slice(0, 23).replace('T', ' ')}
        ${req.method} ${req.path}
        Headers: ${JSON.stringify(req.headers.authorization)}
        Body: ${JSON.stringify(req.body)}
    `);
  next();
});

export default router;
