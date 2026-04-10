import type { Request, Response, NextFunction } from 'express';
import { PROVIDER } from '../config.ts';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(`[${PROVIDER}] Error:`, err.message);
  res.status(500).json({ error: err.message });
}
