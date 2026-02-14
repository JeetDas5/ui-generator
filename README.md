# Ryze UI Generator

Generate React UI layouts from a prompt using a fixed component registry. The app renders a live preview and code editor via Sandpack, and validates model output on both the server and client.

## Live preview

[https://ui-generator-six.vercel.app](https://ui-generator-six.vercel.app/)

## Features

- Prompt-driven UI generation with a constrained component library
- Live preview + editable code via Sandpack
- JSON-only model output with schema validation
- Dark-mode Tailwind tokens baked into generated code

## Tech Stack

- Next.js (App Router)
- React 19
- OpenRouter (OpenAI SDK)
- Tailwind CSS
- Sandpack

## Getting Started

Install dependencies:

```bash
pnpm install
```

Create a `.env.local` file and set your API key:

```bash
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=stepfun/step-3.5-flash:free
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=your-database-url
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `app/` - Next.js routes and API handlers
- `components/ui-library/` - fixed UI component registry
- `lib/registry.ts` - component registry exposed to the model
- `app/api/generate/route.ts` - OpenRouter request + response validation

## How It Works

1. The client collects a chat-style prompt and sends it to the API route.
2. The server injects the component registry and strict output rules.
3. The model returns JSON with `plan`, `code`, and `explanation`.
4. The client validates and renders the generated code in Sandpack.

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## Notes

- The model is restricted to components in `components/ui-library`.
- Generated code must use `@/components/ui-library/*` imports only.

Build with 💝 by Jeet Das
