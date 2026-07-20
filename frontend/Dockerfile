FROM node:22-alpine AS builder

WORKDIR /app

# (Optional) Vite build-time env — make ARGs visible to the build
ARG VITE_API_URL
ARG VITE_BASE_URL
ARG VITE_APP_TITLE
ARG VITE_APP_DESCRIPTION
ARG VITE_MAPTILER_KEY
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_APP_DESCRIPTION=${VITE_APP_DESCRIPTION}
ENV VITE_MAPTILER_KEY=${VITE_MAPTILER_KEY}

# Enable Corepack and activate a specific pnpm version
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

# Copy only manifests first to leverage Docker layer caching
# If you use pnpm, prefer copying pnpm-lock.yaml. Fall back to package.json if needed.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the source and build
COPY . .
RUN pnpm run build

FROM node:22-alpine

WORKDIR /app

# Use npm here to avoid re-enabling Corepack in the runtime image
RUN npm i -g http-server@14

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts/server .
# Add entrypoint for SPA redirection
RUN cp ./dist/index.html ./dist/404.html

EXPOSE 80
CMD ["sh", "./server", "./dist"]
