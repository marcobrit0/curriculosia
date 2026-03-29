# Currículos IA

**AI-powered CV builder for Brazil** — built on top of [Currículos IA](https://github.com/AmruthPillai/Reactive-Resume).

Currículos IA é um criador de currículos gratuito e de código aberto, com inteligência artificial, feito para o mercado brasileiro.

## Features

- Free and open-source resume builder
- AI-powered content suggestions
- 12+ professional templates
- Export to PDF, DOCX, and more
- Multi-language support (default: pt-BR)
- Self-hostable with Docker
- Real-time collaboration
- Privacy-focused — your data stays yours

## Tech Stack

- **Frontend**: React 19, TanStack Router, Tailwind CSS 4, Motion
- **Backend**: Nitro, oRPC, Drizzle ORM
- **Database**: PostgreSQL
- **AI**: AI SDK with OpenAI, Anthropic, Google, and Ollama support
- **Auth**: Better Auth
- **Storage**: S3-compatible (SeaweedFS, MinIO, AWS S3)

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL
- Docker (optional, for self-hosting)

### Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm db:push

# Start the dev server
pnpm dev
```

### Docker

```bash
docker compose up -d
```

The app will be available at `http://localhost:3000`.

## Credits

This project is a fork of [Currículos IA](https://github.com/AmruthPillai/Reactive-Resume) by [Marco Brito](https://curriculos.ia.br), licensed under MIT.

## License

MIT
