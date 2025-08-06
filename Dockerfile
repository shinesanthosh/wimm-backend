# syntax=docker/dockerfile:1

# WIMM Backend - Production Docker Image
# Multi-stage build for optimized production deployment

ARG NODE_VERSION=20.12.2

################################################################################
# Base stage with common setup
FROM node:${NODE_VERSION}-alpine as base

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S wimm -u 1001

################################################################################
# Dependencies stage - install production dependencies
FROM base as deps

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies with cache optimization
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile --silent && \
    yarn cache clean

################################################################################
# Build stage - compile TypeScript
FROM base as build

# Copy package files
COPY package.json yarn.lock tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile --silent

# Copy source code
COPY src/ ./src/

# Build the application
RUN yarn build && \
    rm -rf src/ node_modules/

################################################################################
# Production stage - minimal runtime image
FROM base as production

# Set production environment
ENV NODE_ENV=production
ENV PORT=3010

# Create logs directory
RUN mkdir -p /usr/src/app/logs && \
    chown -R wimm:nodejs /usr/src/app

# Switch to non-root user
USER wimm

# Copy package.json for runtime
COPY --chown=wimm:nodejs package.json ./

# Copy production dependencies from deps stage
COPY --from=deps --chown=wimm:nodejs /usr/src/app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=wimm:nodejs /usr/src/app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3010/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 3010

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["yarn", "start"]
