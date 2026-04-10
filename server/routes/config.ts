import { Router, type Request, type Response } from 'express';
import { PROVIDER, getProviderConfig } from '../config.ts';

const router = Router();

router.get('/config', (_req: Request, res: Response) => {
  const config = getProviderConfig();
  res.json({
    provider: PROVIDER,
    model: config.model,
    hasKey: !!config.apiKey,
  });
});

export default router;
