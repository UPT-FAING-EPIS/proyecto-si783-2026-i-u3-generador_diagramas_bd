FROM node:22-alpine AS builder

WORKDIR /repo
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/frontend-app/package.json apps/web/frontend-app/package.json
RUN pnpm install --filter @fluxsql/web... --frozen-lockfile

COPY apps/web/frontend-app apps/web/frontend-app
WORKDIR /repo/apps/web/frontend-app
ARG NEXT_PUBLIC_SUPABASE_URL=
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=
ENV DATABASE_URL=postgres://fluxsql:fluxsql@127.0.0.1:5432/fluxsql
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /repo/apps/web/frontend-app/.next/standalone ./
COPY --from=builder /repo/apps/web/frontend-app/public ./apps/web/frontend-app/public
COPY --from=builder /repo/apps/web/frontend-app/.next/static ./apps/web/frontend-app/.next/static

WORKDIR /app/apps/web/frontend-app

EXPOSE 3000
CMD ["node", "server.js"]
