# ==============================================================================
# BridGenta BECC v2 — Production Container Image (BECC-NEXT-007)
# Multi-stage minimal footprint, non-root execution, native healthcheck
# ==============================================================================

# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and workspace configuration
COPY package.json package-lock.json* ./
COPY packages/governed-learning ./packages/governed-learning
COPY becc-runtime ./becc-runtime

# Install dependencies and build TypeScript bundles
RUN npm ci --ignore-scripts && \
    npm --prefix packages/governed-learning ci && \
    npm --prefix packages/governed-learning run build && \
    npm --prefix becc-runtime ci && \
    npm --prefix becc-runtime run build

# Production Runtime Stage
FROM node:22-alpine AS runtime

LABEL maintainer="BridGenta Team <architecture@bridgenta.com>" \
      service="becc-runtime" \
      version="2.0.0-GA" \
      description="BridGenta BECC v2 Deployed Runtime Service"

WORKDIR /app/becc-runtime

# Copy compiled bundles and runtime dependencies
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/governed-learning /app/packages/governed-learning
COPY --from=builder /app/becc-runtime/package.json ./package.json
COPY --from=builder /app/becc-runtime/node_modules ./node_modules
COPY --from=builder /app/becc-runtime/dist ./dist
COPY --from=builder /app/becc-runtime/provisioning ./provisioning

# Enforce non-root execution
USER node

# Runtime network configuration
ENV NODE_ENV=production \
    BECC_PORT=8080 \
    BECC_HOST=0.0.0.0

EXPOSE 8080

# Native Node.js Healthcheck probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:8080/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Deployed runtime HTTP service entrypoint
CMD ["node", "dist/bin/server.js"]
