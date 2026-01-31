# ============================================
# EMS WeCare - Multi-stage Docker Build
# Frontend: React + Vite
# Backend: Node.js + Express + SQLite
# ============================================

# ----------------------------------------
# Stage 1: Build Frontend
# ----------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy frontend source
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Build frontend for production
RUN npm run build

# ----------------------------------------
# Stage 2: Build Backend
# ----------------------------------------
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY wecare-backend/package*.json ./

# Install dependencies (including dev for building)
RUN npm ci

# Copy backend source
COPY wecare-backend/src/ ./src/
COPY wecare-backend/tsconfig.json ./

# Build TypeScript to JavaScript
RUN npm run build 2>/dev/null || echo "No build step needed"

# ----------------------------------------
# Stage 3: Production Image
# ----------------------------------------
FROM node:20-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S wecare -u 1001 -G nodejs

WORKDIR /app

# Copy backend dependencies and source
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/src ./src
COPY wecare-backend/package*.json ./

# Copy built frontend to serve as static files
COPY --from=frontend-builder /app/frontend/dist ./public

# Create directories for data persistence
RUN mkdir -p /app/db /app/uploads /app/backups /app/logs && \
    chown -R wecare:nodejs /app

# Copy database schema
COPY wecare-backend/db/schema.sql ./db/

# Switch to non-root user
USER wecare

# Environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0 \
    JWT_SECRET=change-this-in-production \
    DB_PATH=/app/db/wecare.db

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/api/csrf-token || exit 1

# Start the application
CMD ["node", "src/index.ts"]
