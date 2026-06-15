# Multi-stage build — tránh lỗi EBUSY cache của Nixpacks trên Railway
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# --- Dependencies (full, for build) ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Build ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Production ---
FROM base AS production
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

RUN mkdir -p uploads/products uploads/news \
  && chown -R node:node /app

USER node
EXPOSE 3001
CMD ["node", "dist/main"]
