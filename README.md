# MCP Chat

A dual-personality chat interface powered by Claude AI with two distinct modes:

- **Contrarian Mode** ⚡: Challenges ideas with critical thinking and alternative perspectives
- **Agreeable Mode** 💫: Validates and builds upon your thoughts with supportive responses

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up your API key:
```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-...
```

3. Start the application:
```bash
npm run dev
```

The chat interface will open at `http://localhost:3000`

## Architecture

- **Client**: Modern web UI built with TypeScript and Vite
- **API Server**: Node.js backend that interfaces with Claude AI
- **MCP Server**: Optional MCP protocol implementation
- **AI Engine**: Claude 3.5 Sonnet for intelligent responses

## How It Works

The application uses different system prompts for each mode:

- **Contrarian**: Trained to find flaws, question assumptions, and provide counterarguments
- **Agreeable**: Trained to validate ideas, offer support, and build upon thoughts

Each response is generated in real-time by Claude based on your input and the selected mode.

## Scripts

- `npm run dev` - Start both API server and client in development mode
- `npm run api` - Start only the API server
- `npm run client` - Start only the web interface
- `npm run mcp` - Start the MCP server (optional)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
