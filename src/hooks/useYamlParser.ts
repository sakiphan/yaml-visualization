import { useState, useEffect, useRef } from 'react';
import YAML from 'js-yaml';
import type { Node } from 'reactflow';
import { yamlToTree, layoutElements, getYamlErrorLine } from '../utils/yamlUtils';
import type { YamlFlowData, UseYamlParserReturn } from '../types';

const DEBOUNCE_DELAY = 700;

export function useYamlParser(yamlText: string): UseYamlParserReturn {
  const [flows, setFlows] = useState<YamlFlowData[]>([]);
  const [errors, setErrors] = useState<(string | null)[]>([]);
  const [yamlErrorLine, setYamlErrorLine] = useState<number | null>(null);
  const [yamlErrorMsg, setYamlErrorMsg] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setYamlErrorLine(null);
      setYamlErrorMsg('');

      if (!yamlText.trim()) {
        setFlows([]);
        setErrors([]);
        setShowErrorModal(false);
        return;
      }

      try {
        const docs: unknown[] = [];
        YAML.loadAll(yamlText, (doc) => docs.push(doc));

        const newFlows: YamlFlowData[] = [];
        const newErrors: (string | null)[] = [];
        let hasError = false;

        docs.forEach((doc, idx) => {
          try {
            if (!doc) throw new Error('Empty document');

            const rootNode: Node = {
              id: `root${idx}`,
              type: 'custom',
              data: { label: 'YAML', isLeaf: false },
              position: { x: 0, y: 0 },
            };

            const { nodes, edges } = yamlToTree(doc, `root${idx}`, [rootNode]);
            const layoutedNodes = layoutElements(nodes, edges, 'TB');
            newFlows.push({ nodes: layoutedNodes, edges });
            newErrors.push(null);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            newFlows.push({ nodes: [], edges: [] });
            newErrors.push('YAML error: ' + message);
            const line = getYamlErrorLine(message);
            setYamlErrorLine(line);
            setYamlErrorMsg(message);
            hasError = true;
          }
        });

        setFlows(newFlows);
        setErrors(newErrors);
        setShowErrorModal(hasError && !!yamlText.trim());
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setFlows([]);
        setErrors(['YAML error: ' + message]);
        const line = getYamlErrorLine(message);
        setYamlErrorLine(line);
        setYamlErrorMsg(message);
        setShowErrorModal(!!yamlText.trim());
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(debounceRef.current);
  }, [yamlText]);

  return { flows, errors, yamlErrorLine, yamlErrorMsg, showErrorModal, setShowErrorModal };
}
