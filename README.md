<div align="center">

<br>

```
                ╭─────────────────────────────────╮
                │                                 │
                │    ╭──╮  YAML   ╭──┬──╮        │
                │    │  ├────────►│  │  │        │
                │    ╰──╯  VIZ    ╰──┴──╯        │
                │                                 │
                ╰─────────────────────────────────╯
```

# YAML Visualizer

**Paste. Parse. Visualize. Auto-fix.**

A developer tool that turns YAML into interactive tree diagrams — with AI-powered error correction.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

<br>

## Features

```
  ┌─────────────┐     ┌──────────────┐     ┌───────────────┐
  │  YAML Input  │────►│  Parse Tree  │────►│  Interactive   │
  │  Editor      │     │  Generation  │     │  Visualization │
  └──────┬──────┘     └──────────────┘     └───────┬───────┘
         │                                         │
         │  error?                                 │
         ▼                                         ▼
  ┌─────────────┐     ┌──────────────┐     ┌───────────────┐
  │  Error       │────►│  AI Auto-Fix │     │  PNG Export    │
  │  Detection   │     │  (Multi-LLM) │     │  Download      │
  └─────────────┘     └──────────────┘     └───────────────┘
```

- **Live Tree Visualization** — YAML parsed into interactive node graphs via ReactFlow + Dagre layout
- **Syntax Error Detection** — Highlights the exact error line with context
- **AI Auto-Fix** — One-click error correction powered by your choice of LLM
- **Multi-Provider Support** — Claude, OpenRouter, vLLM, or any OpenAI-compatible API
- **Multi-Document YAML** — Supports `---` separated documents, each with its own diagram
- **PNG Export** — Download any visualization as an image
- **Dark Theme** — "Terminal Luxe" aesthetic designed for developers

<br>

## Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 19, TypeScript, Vite 6 |
| **Visualization** | ReactFlow, Dagre (hierarchical layout) |
| **YAML Engine** | js-yaml (multi-document) |
| **Server** | Express 5, TypeScript, tsx |
| **AI Providers** | Anthropic Claude, OpenRouter, vLLM |
| **Export** | html-to-image |
| **Deploy** | Docker, Docker Compose |

<br>

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/dolphinium/yaml-visualization.git
cd yaml-visualization
npm install
```

### 2. Configure Provider

Copy the env template and set your preferred provider:

```bash
cp .env.bak .env
```

```env
# Pick one: claude | openrouter | vllm
PROVIDER=claude

# Then fill in the matching credentials ↓
```

<details>
<summary><b>Claude (Anthropic)</b></summary>

```env
PROVIDER=claude
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6          # optional, this is the default
```
</details>

<details>
<summary><b>OpenRouter</b></summary>

```env
PROVIDER=openrouter
OPEN_ROUTER_API_KEY=sk-or-...
OPEN_ROUTER_MODEL=anthropic/claude-sonnet-4-6   # or any model on openrouter.ai
```
</details>

<details>
<summary><b>vLLM / Local Models</b></summary>

```env
PROVIDER=vllm
VLLM_API_URL=http://localhost:8000/v1/chat/completions
VLLM_MODEL=your-model-name
VLLM_API_KEY=                           # optional, if your vLLM requires auth
```
</details>

### 3. Run

You need two terminals:

```bash
# Terminal 1 — Frontend
npm run dev
```

```bash
# Terminal 2 — API Server
npx tsx server/index.ts
```

Open **http://localhost:5173** and start pasting YAML.

<br>

## Docker

### Docker Compose (Recommended)

```bash
# Make sure .env is configured
docker-compose up -d
```

### Manual Docker Run

```bash
docker build -t yaml-visualizer .
docker run -p 5173:4173 -p 3001:3001 --env-file .env yaml-visualizer
```

| Port | Service |
|:-----|:--------|
| `5173` | Frontend (Vite / serve) |
| `3001` | API Server |

<br>

## Project Structure

```
yaml-visualization/
│
├── src/                          # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── YamlEditor.tsx        # Editor with line numbers & error highlighting
│   │   ├── FlowPanel.tsx         # ReactFlow visualization wrapper
│   │   ├── ErrorModal.tsx        # Error display + AI fix trigger
│   │   └── CustomNode.tsx        # Themed ReactFlow node component
│   ├── hooks/
│   │   ├── useYamlParser.ts      # Debounced YAML parsing logic
│   │   └── useClaudeFix.ts       # AI fix API integration
│   ├── utils/
│   │   └── yamlUtils.ts          # Tree generation & Dagre layout
│   ├── types/
│   │   └── index.ts              # Shared TypeScript interfaces
│   ├── styles/
│   │   └── app.css               # Terminal Luxe theme
│   ├── App.tsx                   # Main application
│   └── main.tsx                  # Entry point
│
├── server/                       # API Server (Express + TypeScript)
│   ├── providers/
│   │   ├── claude.ts             # Anthropic API
│   │   ├── openai.ts             # OpenRouter / vLLM / OpenAI-compat
│   │   └── index.ts              # Provider factory
│   ├── routes/
│   │   ├── fix.ts                # POST /api/fix
│   │   └── config.ts             # GET /api/config
│   ├── middleware/
│   │   └── errorHandler.ts       # Centralized error handling
│   ├── config.ts                 # Environment & provider config
│   ├── index.ts                  # Server entry point
│   └── tsconfig.json             # Server TS config
│
├── tsconfig.json                 # Frontend TS config
├── vite.config.ts                # Vite configuration
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Compose orchestration
└── .env.bak                      # Environment template
```

<br>

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│  ┌──────────┐  yaml  ┌──────────────┐  nodes  ┌─────────────┐ │
│  │ YamlEditor├───────►│ useYamlParser├────────►│  FlowPanel  │ │
│  └──────────┘        │  (debounce)  │         │  (ReactFlow) │ │
│       │              └──────┬───────┘         └──────┬──────┘ │
│       │                error│                   png  │        │
│       ▼                     ▼                        ▼        │
│  ┌──────────┐        ┌──────────┐            ┌───────────┐   │
│  │ErrorModal │───fix──►│useClaudeFix│           │html-to-img│   │
│  └──────────┘        └─────┬────┘            └───────────┘   │
│                            │                                   │
└────────────────────────────┼───────────────────────────────────┘
                             │ POST /api/fix
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API SERVER (Express)                         │
│                                                                 │
│  ┌────────┐     ┌──────────────────────────────────────┐       │
│  │ Routes  │────►│           Provider Factory            │       │
│  └────────┘     │                                      │       │
│                 │  ┌─────────┐ ┌──────────┐ ┌──────┐  │       │
│                 │  │ Claude  │ │OpenRouter│ │ vLLM │  │       │
│                 │  └────┬────┘ └────┬─────┘ └──┬───┘  │       │
│                 └───────┼──────────┼──────────┼───────┘       │
│                         │          │          │                 │
└─────────────────────────┼──────────┼──────────┼─────────────────┘
                          ▼          ▼          ▼
                    Anthropic    OpenRouter    Local
                      API          API        Model
```

<br>

## API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/fix` | Send broken YAML + error message, receive fixed YAML |
| `POST` | `/api/claude-fix` | Legacy endpoint (redirects to `/api/fix`) |
| `GET` | `/api/config` | Returns current provider, model, and key status |

**POST /api/fix** request body:
```json
{
  "yamlText": "apiVersion: v1\n  kind: Service",
  "errorMsg": "bad indentation of a mapping entry at line 2"
}
```

**Response** (normalized across all providers):
```json
{
  "content": [{ "text": "apiVersion: v1\nkind: Service\n" }]
}
```

<br>

## Scripts

| Command | Description |
|:--------|:------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run typecheck` | TypeScript type checking only |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |
| `npx tsx server/index.ts` | Start API server |

<br>

## Security

- API keys are **never** exposed to the frontend — all LLM calls go through the server
- `.env` is in `.gitignore` — credentials stay local
- CORS is configured for local development only
- The server acts as a secure proxy between browser and LLM providers

<br>

---

<div align="center">

**Built with TypeScript, React, and caffeine.**

</div>
