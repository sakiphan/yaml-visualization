import type { ProviderConfig } from '../config.ts';
import { callClaude } from './claude.ts';
import { callOpenAI } from './openai.ts';

export function callProvider(prompt: string, config: ProviderConfig): Promise<string> {
  return config.format === 'anthropic'
    ? callClaude(prompt, config)
    : callOpenAI(prompt, config);
}
