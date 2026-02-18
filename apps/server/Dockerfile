FROM node:20-alpine

WORKDIR /app

# Copy package manifests first for layer caching
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json ./apps/server/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json

# Copy source (node_modules excluded via .dockerignore)
COPY . .

# Install deps after source copy so node_modules is not overwritten
RUN corepack enable && pnpm install --frozen-lockfile=false

RUN pnpm --filter @collabboard/shared build && pnpm --filter server build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["sh", "-c", "pnpm --filter server exec prisma migrate deploy && pnpm --filter server start"]
