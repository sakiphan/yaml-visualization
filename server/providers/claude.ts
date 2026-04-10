import type { ProviderConfig } from '../config.ts';

interface AnthropicResponse {
  content?: { text: string }[];
  error?: { message?: string };
}

export async function callClaude(prompt: string, config: ProviderConfig): Promise<string> {
  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data: AnthropicResponse = await res.json();

  if (data.content?.[0]?.text) return data.content[0].text;
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  throw new Error('Unexpected Anthropic response');
}
