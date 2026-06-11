# Stage 1: Dependencies
FROM node:20-slim AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# Stage 2: Builder 
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

# Copy Prisma client from deps stage
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma

# Copy source and compile TypeScript to dist/
COPY src ./src
COPY prisma ./prisma

RUN npm run build

# Stage 3: Production image
FROM node:20-slim AS runner

WORKDIR /app

RUN groupadd -g 1001 -S nodejs && \
    useradd -S fastify -u 1001

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output and Prisma client
COPY --from=builder --chown=fastify:nodejs /app/dist ./dist
COPY --from=builder --chown=fastify:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps --chown=fastify:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=fastify:nodejs /app/prisma ./prisma

USER fastify

EXPOSE 3001

CMD ["node", "dist/server.js"]