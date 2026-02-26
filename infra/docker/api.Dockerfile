FROM node:24.14.0-alpine AS base
WORKDIR /workspace
RUN apk add --no-cache curl && corepack enable && corepack prepare pnpm@10.30.2 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config-eslint/package.json packages/config-eslint/package.json
COPY packages/config-typescript/package.json packages/config-typescript/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/shared-utils/package.json packages/shared-utils/package.json
RUN pnpm install --frozen-lockfile

FROM base AS dev
COPY --from=deps /workspace/ ./
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter @swapsphere/shared-types build && pnpm --filter @swapsphere/shared-utils build && pnpm --filter @swapsphere/api prisma:generate && pnpm --filter @swapsphere/api prisma:push && pnpm --filter @swapsphere/api prisma:seed:if-empty && pnpm --filter @swapsphere/api exec tsx watch src/server.ts"]
