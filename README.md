# MCP Chat

A professional dual-personality chat interface powered by Claude AI with two distinct conversational modes.

## Features

- **Contrarian Mode** ⚡: Challenges ideas with critical thinking and alternative perspectives
- **Agreeable Mode** 💫: Validates and builds upon your thoughts with supportive responses
- **Clean Architecture**: Separation of concerns with shared types, services, and utilities
- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Code Quality**: ESLint + Prettier for consistent, maintainable code
- **Logging**: Structured logging system for debugging and monitoring
- **Error Handling**: Custom error classes with detailed error information
- **Input Validation**: Sanitization and validation of user input
- **Health Checks**: Built-in health endpoint for monitoring

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### 3. Start the application

```bash
npm run dev
```

The chat interface will open at `http://localhost:3000`

## Architecture

### Project Structure

```
mcpchat/
├── shared/                  # Shared code between frontend and backend
│   ├── constants/          # Shared constants and configuration
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Shared utilities (logger, validation)
├── server/                  # Backend server code
│   ├── config/             # Server configuration
│   ├── errors/             # Custom error classes
│   ├── services/           # Business logic services
│   ├── types/              # Server-specific types
│   ├── api.ts              # HTTP API server
│   └── index.ts            # MCP server
├── src/                     # Frontend application
│   ├── config/             # Client configuration
│   ├── errors/             # Client error classes
│   ├── services/           # API communication services
│   ├── main.ts             # Main application entry
│   └── styles.css          # Styling
└── index.html              # HTML entry point
```

### Layer Architecture

**Shared Layer:**

- `types/` - Common TypeScript interfaces and types
- `constants/` - System prompts, API config, error messages
- `utils/` - Logger, validation, sanitization

**Backend Layer:**

- `config/` - Environment configuration with validation
- `services/` - AI service for Anthropic API integration
- `errors/` - Custom error classes (AIServiceError)
- `api.ts` - HTTP server with CORS, health checks, error handling

**Frontend Layer:**

- `config/` - Client-side configuration
- `services/` - API service for backend communication
- `errors/` - Custom error classes (APIError)
- `main.ts` - Chat UI application with event handling

### Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.7+
- **Frontend**: Vite 6.0
- **AI**: Claude 3.5 Haiku via Anthropic API
- **MCP**: Model Context Protocol SDK 1.0
- **Code Quality**: ESLint + Prettier

## Scripts

### Development

```bash
npm run dev        # Start both API server and client
npm run api        # Start only the API server (port 3001)
npm run client     # Start only the web interface (port 3000)
npm run mcp        # Start the MCP server
```

### Building

```bash
npm run build         # Build both client and server
npm run build:client  # Build only the client
npm run build:server  # Build only the server
npm run preview       # Preview production build
```

### Code Quality

```bash
npm run validate      # Run all checks (type-check + lint + format)
npm run type-check    # Run TypeScript type checking
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## API Endpoints

### Health Check

```bash
GET http://localhost:3001/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2025-10-29T19:43:33.738Z",
  "hasApiKey": true
}
```

### Chat

```bash
POST http://localhost:3001/chat
Content-Type: application/json

{
  "message": "Your message here",
  "mode": "contrarian"  # or "agreeable"
}
```

Response:

```json
{
  "response": "AI generated response"
}
```

## Configuration

### Environment Variables

- `ANTHROPIC_API_KEY` - Your Anthropic API key (required)
- `PORT` - API server port (default: 3001)
- `ANTHROPIC_MODEL` - Model to use (default: claude-3-5-haiku-20241022)
- `MAX_TOKENS` - Maximum tokens per response (default: 300)
- `NODE_ENV` - Environment mode (development/production)

### Client Environment Variables

- `VITE_API_URL` - API server URL for production
- `VITE_API_PORT` - API server port (default: 3001)

## Development Guidelines

### Code Style

- **TypeScript Strict Mode**: All code uses strict TypeScript settings
- **Import Types**: Use `import type` for type-only imports
- **Error Handling**: Use custom error classes with proper error propagation
- **Logging**: Use the logger utility instead of console.log
- **Validation**: Always validate and sanitize user input

### Adding New Features

1. Define types in `shared/types/`
2. Add constants in `shared/constants/`
3. Create service methods in appropriate service files
4. Add proper error handling with custom errors
5. Write JSDoc comments for all public methods
6. Run `npm run validate` before committing

## How It Works

### Conversation Modes

The application uses distinct system prompts for each mode:

**Contrarian Mode:**

- Challenges statements with logical counterarguments
- Finds flaws and presents alternative perspectives
- Questions assumptions with intellectual rigor
- Provides constructive disagreement

**Agreeable Mode:**

- Validates and supports user ideas
- Finds genuine merit in their thoughts
- Offers encouragement and positive expansion
- Builds upon ideas thoughtfully

### Request Flow

1. User types message in UI
2. Frontend validates and sends to API service
3. API service sanitizes input and calls backend
4. Backend validates request structure
5. AI service generates response using appropriate system prompt
6. Response flows back through layers with error handling
7. UI displays response with mode-specific styling

## License

MIT
