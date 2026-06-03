# Build context: repo root
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install deps (only what bot + shared need)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/bot/package.json ./packages/bot/
RUN pnpm install --frozen-lockfile

# Build
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY packages/bot ./packages/bot
RUN pnpm --filter @nul/shared build && pnpm --filter @nul/bot build

FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/bot/package.json ./packages/bot/
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/bot/dist ./packages/bot/dist

WORKDIR /app/packages/bot
CMD ["node", "dist/index.js"]
