import { useState, useCallback } from 'react';
import type { UseClaudeFixReturn, ClaudeApiResponse } from '../types';

const API_BASE = 'http://localhost:3001';

export function useClaudeFix(): UseClaudeFixReturn {
  const [isFixing, setIsFixing] = useState(false);

  const fixWithClaude = useCallback(
    async (yamlText: string, errorMsg: string): Promise<string | null> => {
      setIsFixing(true);
      try {
        const response = await fetch(`${API_BASE}/api/fix`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ yamlText, errorMsg }),
        });

        const data: ClaudeApiResponse = await response.json();

        if (data.content?.[0]?.text) {
          let fixed = data.content[0].text;
          if (fixed.startsWith('```')) {
            fixed = fixed.replace(/```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
          }
          return fixed;
        } else if (data.error) {
          alert('API Error: ' + data.error);
        } else {
          alert('Unexpected response: ' + JSON.stringify(data));
        }
        return null;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        alert('Auto-fix failed: ' + message);
        return null;
      } finally {
        setIsFixing(false);
      }
    },
    []
  );

  return { isFixing, fixWithClaude };
}
