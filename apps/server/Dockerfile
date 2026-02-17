FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json

RUN corepack enable && pnpm install --frozen-lockfile=false

COPY . .

RUN pnpm --filter server build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["pnpm", "--filter", "server", "start"]
