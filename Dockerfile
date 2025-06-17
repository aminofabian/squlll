# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy rest of the app
COPY . .

# Build NestJS app
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
