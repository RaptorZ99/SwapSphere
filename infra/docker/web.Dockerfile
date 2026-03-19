FROM node:24.14.0-alpine AS base
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json tsconfig.node.json tsconfig.react.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

FROM base AS dev
COPY --from=deps /workspace/ ./
COPY . .
EXPOSE 5173
CMD ["sh", "-c", "pnpm --filter @swapsphere/shared build && pnpm --filter @swapsphere/web dev --host 0.0.0.0 --port 5173"]
