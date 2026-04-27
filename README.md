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

## Production Launch Checklist

Before deploying to production, verify the following:

- [ ] `AUTH_SECRET` is set to a unique value generated with `openssl rand -hex 32` (the app refuses to boot with the placeholder).
- [ ] SMTP is configured (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`), or `EMAIL_TRANSPORT="console"` is set explicitly to opt in to console-logged emails.
- [ ] `FLAG_DEBUG_PRINTER="false"` (or unset) in the production environment.
- [ ] `FLAG_DISABLE_AI="true"` until the premium AI flow is implemented.
- [ ] Automated database backups are configured and a restore has been tested.
- [ ] Browserless (or alternative Chrome service) is reachable from the app and has health checks.
- [ ] HTTPS is enforced (`force_https = true` in `fly.toml`).

## Credits

This project is a fork of [Currículos IA](https://github.com/AmruthPillai/Reactive-Resume) by [Marco Brito](https://curriculos.ia.br).
