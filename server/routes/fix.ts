import { Router, type Request, type Response, type NextFunction } from 'express';
import { PROVIDER, getProviderConfig } from '../config.ts';
import { callProvider } from '../providers/index.ts';

const router = Router();

function buildPrompt(yamlText: string, errorMsg: string): string {
  return [
    `The following YAML file contains an error. Error message: ${errorMsg}`,
    'Please fix the YAML and return only the corrected YAML output, nothing else.',
    '',
    'Broken YAML:',
    yamlText,
  ].join('\n');
}

router.post('/fix', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { yamlText, errorMsg } = req.body;
    const config = getProviderConfig();
    const prompt = buildPrompt(yamlText, errorMsg);

    console.log(`[${PROVIDER}] model: ${config.model}`);

    const text = await callProvider(prompt, config);
    res.json({ content: [{ text }] });
  } catch (err) {
    next(err);
  }
});

// Backward compat
router.post('/claude-fix', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { yamlText, errorMsg } = req.body;
    const config = getProviderConfig();
    const prompt = buildPrompt(yamlText, errorMsg);
    const text = await callProvider(prompt, config);
    res.json({ content: [{ text }] });
  } catch (err) {
    next(err);
  }
});

export default router;
