# Coolify / container deploy for SQUL-admin (Next.js).
# Build context: repo root. Listens on 3000.
# bun.lock is the authoritative lockfile (package-lock.json is gitignored).

FROM oven/bun:1-alpine AS build
RUN apk add --no-cache libc6-compat
# Avoid WORKDIR /app — Next has an `app/` directory.
WORKDIR /srv/squl

COPY package.json bun.lock ./
COPY shared ./shared
RUN bun install --frozen-lockfile

COPY . .

# NEXT_PUBLIC_* are inlined into the client bundle at build time.
ARG SOURCE_COMMIT
ARG GRAPHQL_API_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_GRAPHQL_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV GITHUB_SHA=$SOURCE_COMMIT \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS=--max-old-space-size=3072 \
    GRAPHQL_API_URL=$GRAPHQL_API_URL \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_PUBLIC_GRAPHQL_API_URL=$NEXT_PUBLIC_GRAPHQL_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN bun run build

FROM oven/bun:1-alpine AS run
RUN apk add --no-cache libc6-compat
WORKDIR /srv/squl
ARG SOURCE_COMMIT
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    GITHUB_SHA=$SOURCE_COMMIT

COPY --from=build /srv/squl/package.json ./
COPY --from=build /srv/squl/node_modules ./node_modules
COPY --from=build /srv/squl/next.config.ts ./
COPY --from=build /srv/squl/public ./public
COPY --from=build /srv/squl/.next ./.next
COPY --from=build /srv/squl/shared ./shared

EXPOSE 3000
CMD ["bun", "run", "start:prod", "--", "-p", "3000", "-H", "0.0.0.0"]
