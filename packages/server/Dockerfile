FROM node:22-alpine
RUN npm install -g pnpm@latest
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
RUN pnpm install

COPY packages/shared/ ./packages/shared/
COPY packages/server/ ./packages/server/
RUN pnpm --filter @nul/shared build && pnpm --filter @nul/server build

EXPOSE 3000
CMD ["node", "packages/server/dist/index.js"]
