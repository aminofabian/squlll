# Use official Bun image
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy rest of the app
COPY . .

# Build NestJS app
RUN bun run build

# Expose the app port
EXPOSE 3000

# Start the app with Bun
CMD ["bun", "run", "start:prod"]
