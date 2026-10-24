# syntax=docker/dockerfile:1

# ---------- Build: frontend (Vite) + server bundle ----------
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
# Keep only runtime dependencies for the final image (no second download).
RUN npm prune --omit=dev && npm cache clean --force

# ---------- Runtime ----------
FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /app

COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules

# Server bundle, built frontend, SQL migrations, seed catalog and public assets.
COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
COPY public ./public
COPY src/data ./src/data
COPY firebase-applet-config.json ./

# Writable folders for the non-root user (uploads, embedded DB fallback).
RUN mkdir -p public/uploads .data && chown -R node:node public/uploads .data
USER node

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server.cjs"]
