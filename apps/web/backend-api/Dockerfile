FROM node:22-alpine AS builder

WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/backend-api/package.json apps/web/backend-api/package.json
RUN pnpm install --filter @fluxsql/api... --frozen-lockfile

COPY apps/web/backend-api apps/web/backend-api
WORKDIR /repo/apps/web/backend-api
RUN pnpm build
RUN pnpm deploy --filter @fluxsql/api --prod --legacy /prod/api

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /prod/api ./

EXPOSE 3001
CMD ["node", "dist/src/main.js"]
