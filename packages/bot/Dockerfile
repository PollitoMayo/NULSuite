FROM node:22-alpine
RUN npm install -g pnpm@latest
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/bot/package.json ./packages/bot/
RUN pnpm install --frozen-lockfile

COPY packages/shared/ ./packages/shared/
COPY packages/bot/ ./packages/bot/
RUN pnpm --filter @nul/shared build && pnpm --filter @nul/bot build

CMD ["node", "packages/bot/dist/index.js"]
