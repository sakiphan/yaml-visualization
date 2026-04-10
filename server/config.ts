import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 3001;
export const PROVIDER = (process.env.PROVIDER || 'claude').toLowerCase();

export interface ProviderConfig {
  url: string;
  apiKey: string;
  model: string;
  format: 'anthropic' | 'openai';
}

const providers: Record<string, ProviderConfig> = {
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.CLAUDE_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
    format: 'anthropic',
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPEN_ROUTER_API_KEY || '',
    model: process.env.OPEN_ROUTER_MODEL || 'anthropic/claude-sonnet-4-6',
    format: 'openai',
  },
  vllm: {
    url: process.env.VLLM_API_URL || 'http://localhost:8000/v1/chat/completions',
    apiKey: process.env.VLLM_API_KEY || '',
    model: process.env.VLLM_MODEL || 'default',
    format: 'openai',
  },
};

export function getProviderConfig(): ProviderConfig {
  const config = providers[PROVIDER];
  if (!config) {
    throw new Error(`Unknown provider: "${PROVIDER}". Use: claude, openrouter, vllm`);
  }
  return config;
}
