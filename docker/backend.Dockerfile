FROM node:18-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install TensorFlow dependencies
RUN pip3 install tensorflow

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared/package.json ./libs/shared/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY apps/backend ./apps/backend
COPY libs/shared ./libs/shared
COPY tsconfig.base.json ./

# Build shared library
RUN cd libs/shared && pnpm build

# Build backend
RUN cd apps/backend && pnpm build

# Create necessary directories
RUN mkdir -p temp data

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "apps/backend/dist/index.js"] 