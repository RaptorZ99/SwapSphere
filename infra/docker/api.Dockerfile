FROM node:24.14.0-alpine AS base
WORKDIR /workspace
RUN apk add --no-cache curl && corepack enable && corepack prepare pnpm@10.30.2 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json tsconfig.node.json tsconfig.react.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

FROM base AS dev
COPY --from=deps /workspace/ ./
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @swapsphere/shared build && pnpm --filter @swapsphere/api prisma:generate && pnpm --filter @swapsphere/api prisma:push && pnpm --filter @swapsphere/api prisma:seed:if-empty && pnpm --filter @swapsphere/api exec tsx watch src/server.ts"]
