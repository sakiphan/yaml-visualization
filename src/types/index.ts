import type { Node, Edge, ReactFlowInstance } from 'reactflow';

// --- YAML Flow Data ---
export interface YamlFlowData {
  nodes: Node[];
  edges: Edge[];
}

// --- Parser Hook ---
export interface UseYamlParserReturn {
  flows: YamlFlowData[];
  errors: (string | null)[];
  yamlErrorLine: number | null;
  yamlErrorMsg: string;
  showErrorModal: boolean;
  setShowErrorModal: (show: boolean) => void;
}

// --- Claude Fix Hook ---
export interface UseClaudeFixReturn {
  isFixing: boolean;
  fixWithClaude: (yamlText: string, errorMsg: string) => Promise<string | null>;
}

// --- Claude API Response ---
export interface ClaudeApiResponse {
  content?: { text: string }[];
  error?: string;
}

// --- Component Props ---
export interface YamlEditorProps {
  yamlText: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  yamlErrorLine: number | null;
  onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  lineNumberRef: React.RefObject<HTMLDivElement | null>;
}

export interface ErrorModalProps {
  show: boolean;
  yamlErrorLine: number | null;
  yamlLines: string[];
  yamlErrorMsg: string;
  isFixing: boolean;
  onFix: () => void;
  onClose: () => void;
}

export interface FlowPanelProps {
  flow: YamlFlowData;
  error: string | null;
  idx: number;
  reactFlowRef: (el: HTMLDivElement | null) => void;
  handleDownloadPng: (idx: number) => () => void;
  handleInit: (idx: number) => (instance: ReactFlowInstance) => void;
}
