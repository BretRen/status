# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm install -g pkg && \
    pkg server.js --targets node18-linux-x64 --output app

# 运行时阶段
FROM alpine:3.18
RUN apk add --no-cache libstdc++
WORKDIR /app
COPY --from=builder /app/app .

# 安全配置
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:3001/health || exit 1

ENTRYPOINT ["./app"]