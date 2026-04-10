import { PROVIDER, type ProviderConfig } from '../config.ts';

interface OpenAIResponse {
  choices?: { message: { content: string } }[];
  error?: { message?: string };
}

export async function callOpenAI(prompt: string, config: ProviderConfig): Promise<string> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  if (PROVIDER === 'openrouter') {
    headers['HTTP-Referer'] = 'https://yaml-visualizer.app';
    headers['X-Title'] = 'YAML Visualizer';
  }

  const res = await fetch(config.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data: OpenAIResponse = await res.json();

  if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  throw new Error('Unexpected OpenAI response');
}
