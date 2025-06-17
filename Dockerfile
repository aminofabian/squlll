# Use a lightweight Node.js image
FROM node:20

# Create app directory
WORKDIR /app

# Copy files
COPY . .

# Install dependencies
RUN npm install --legacy-peer-deps

# Build the NestJS project (if using TypeScript)
RUN npm run build

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
