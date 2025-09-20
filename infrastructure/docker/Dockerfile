# -----------------------------------------------------------------------------
# Critter | Node 22.19.0 slim, Playwright optional
# - Default: light image for API + WDIO(Appium) client to remote providers
# - Optional: install Playwright browsers/libs when WITH_BROWSERS=true
# -----------------------------------------------------------------------------

    FROM node:22.19.0-slim

    WORKDIR /app
    
    # Install base tools (curl for health/debug; tini for PID1)
    RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl tini \
        && rm -rf /var/lib/apt/lists/*
    
    # Use tini as entrypoint to avoid zombie processes
    ENTRYPOINT ["/usr/bin/tini", "--"]
    
    # ---- Dependencies first for better caching
    COPY package*.json ./
    RUN npm ci
    
    # ---- Project files
    COPY . .
    
    # ---- Optional Playwright browsers (for web UI tests)
    # Set at build time: --build-arg WITH_BROWSERS=true
    ARG WITH_BROWSERS=false
    
    # Minimal X/GTK/Fonts stack needed by Chromium/WebKit when browsers are installed
    # Kept behind the build arg to stay slim by default
    RUN if [ "$WITH_BROWSERS" = "true" ]; then \
          apt-get update && apt-get install -y --no-install-recommends \
            wget gnupg \
            libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
            libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
            libgbm1 libpango-1.0-0 libasound2 libx11-xcb1 libxcursor1 \
            libxinerama1 libxi6 libglib2.0-0 libfontconfig1 libxext6 \
            fonts-liberation \
          && rm -rf /var/lib/apt/lists/* \
          && npx playwright install --with-deps; \
        fi
    
    # ---- Build TS (safe to no-op if you run directly from TS)
    RUN npm run build || echo "No build script; skipping TS build"
    
    # Writable dirs for artifacts if you mount them
    RUN mkdir -p reports test-results
    
    # Default: run Playwright with your config (works for API-only too)
    CMD ["npx", "playwright", "test", "-c", "playwright.config.ts"]
    