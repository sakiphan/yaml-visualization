# YAML Visualization & Auto-Fix Tool

This project is a web application for visualizing YAML files as interactive trees and automatically fixing YAML errors using Anthropic Claude API.

## Features
- Paste or write your YAML and see it as a tree diagram
- Detects YAML syntax errors and highlights the problematic line
- One-click "Fix with Claude" button to auto-correct YAML using Claude API
- Download the visualization as a PNG image
- Multi-document YAML support

## Live Demo
You can run the app locally or with Docker Compose (see below).

## Requirements
- Node.js 18+
- Anthropic Claude API key (for auto-fix feature)
- Docker (optional, for containerized usage)

## Local Development
```sh
npm install
npm run dev
```

## Environment Variables
Create a `.env` file in the project root:
```
VITE_CLAUDE_API_KEY=your_claude_api_key_here
```

## Docker Usage
### Build and Run Locally
```sh
docker run -p 5173:4173 -p 3001:3001 \
  -e VITE_CLAUDE_API_KEY=your_claude_api_key_here \
  sakiphan/yaml-visualization:latest
```

### With Docker Compose (Recommended)
1. Make sure your `.env` file contains your Claude API key.
2. Use the following `docker-compose.yml`:
```yaml
version: "3.8"
services:
  yaml-visualization:
    image: sakiphan/yaml-visualization:latest
    ports:
      - "5173:4173"
      - "3001:3001"
    environment:
      - VITE_CLAUDE_API_KEY=${VITE_CLAUDE_API_KEY}
    restart: unless-stopped
```
3. Start the app:
```sh
docker-compose up -d
```

## How It Works
- The frontend is built with React and Vite.
- The backend proxy (Node.js) securely sends YAML and error messages to Claude API for fixing.
- All communication with Claude API is done server-side for security and CORS reasons.

## Security Note
**Never expose your Claude API key in the frontend or public repositories.**