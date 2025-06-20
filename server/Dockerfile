# Use Node.js LTS
FROM node:18-slim

# Install minimal debugging tools
RUN apt-get update && apt-get install -y \
    curl \
    procps \
    tree \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy the rest of the app with explicit paths
COPY ./middleware ./middleware/
COPY ./models ./models/
COPY ./routes ./routes/
COPY ./index.js .
COPY ./.env .

# Debug file existence and content
RUN echo "Verifying middleware/auth.js exists..." && \
    if [ -f "/usr/src/app/middleware/auth.js" ]; then \
        echo "auth.js exists" && \
        cat "/usr/src/app/middleware/auth.js"; \
    else \
        echo "auth.js does not exist"; \
    fi

# Ensure correct permissions
RUN chown -R node:node /usr/src/app && \
    chmod -R 755 /usr/src/app && \
    ls -la /usr/src/app/middleware/

# Switch to non-root user
USER node

# Set environment variables
ENV PORT=8080
ENV NODE_ENV=production
ENV JWT_SECRET=your-default-secret-key-change-in-production

# Explicitly expose the port
EXPOSE 8080

# Health check with explicit port
HEALTHCHECK --interval=3s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/_health || exit 1

# Print debug info and start server
CMD echo "Container starting..." && \
    echo "PORT=$PORT" && \
    echo "NODE_ENV=$NODE_ENV" && \
    echo "JWT_SECRET is set: ${JWT_SECRET:+yes}" && \
    echo "PWD=$PWD" && \
    echo "Current user: $(whoami)" && \
    echo "\nFull directory tree:" && \
    tree /usr/src/app && \
    echo "\nMiddleware directory exists?" && \
    if [ -d "/usr/src/app/middleware" ]; then echo "Yes"; else echo "No"; fi && \
    echo "\nauth.js exists?" && \
    if [ -f "/usr/src/app/middleware/auth.js" ]; then echo "Yes"; else echo "No"; fi && \
    echo "\nMiddleware contents:" && \
    ls -la /usr/src/app/middleware && \
    echo "\nRoutes contents:" && \
    ls -la /usr/src/app/routes && \
    echo "\nFile contents of auth.js:" && \
    cat /usr/src/app/middleware/auth.js && \
    echo "\nFile permissions:" && \
    stat /usr/src/app/middleware/auth.js && \
    echo "\nNode module resolution paths:" && \
    node -e "console.log('Current directory:', process.cwd()); console.log('__dirname:', __dirname); console.log('Module paths:', module.paths); try { console.log('Resolved path:', require.resolve('./middleware/auth.js')); } catch(e) { console.error('Resolution error:', e); }" && \
    echo "\nTrying to require auth.js directly:" && \
    node -e "try { const auth = require('./middleware/auth.js'); console.log('Auth module loaded successfully:', typeof auth); console.log('Module exports:', Object.keys(auth)); } catch (e) { console.error('Error loading auth:', e.message, '\nStack:', e.stack); }" && \
    echo "\nListing all files in /usr/src/app recursively:" && \
    find /usr/src/app -type f && \
    echo "\nStarting server..." && \
    NODE_DEBUG=module,internal/modules node index.js

CMD echo "Listing all files at runtime:" && \
    find . -type f && \
    echo "Container starting..." && \
    echo "PORT=$PORT" && \
    echo "NODE_ENV=$NODE_ENV" && \
    echo "JWT_SECRET is set: ${JWT_SECRET:+yes}" && \
    echo "PWD=$PWD" && \
    echo "Current user: $(whoami)" && \
    echo "\nFull directory tree:" && \
    tree /usr/src/app && \
    echo "\nMiddleware directory exists?" && \
    if [ -d "/usr/src/app/middleware" ]; then echo "Yes"; else echo "No"; fi && \
    echo "\nauth.js exists?" && \
    if [ -f "/usr/src/app/middleware/auth.js" ]; then echo "Yes"; else echo "No"; fi && \
    echo "\nMiddleware contents:" && \
    ls -la /usr/src/app/middleware && \
    echo "\nRoutes contents:" && \
    ls -la /usr/src/app/routes && \
    echo "\nFile contents of auth.js:" && \
    cat /usr/src/app/middleware/auth.js && \
    echo "\nFile permissions:" && \
    stat /usr/src/app/middleware/auth.js && \
    echo "\nNode module resolution paths:" && \
    node -e "console.log('Current directory:', process.cwd()); console.log('__dirname:', __dirname); console.log('Module paths:', module.paths); try { console.log('Resolved path:', require.resolve('./middleware/auth.js')); } catch(e) { console.error('Resolution error:', e); }" && \
    echo "\nTrying to require auth.js directly:" && \
    node -e "try { const auth = require('./middleware/auth.js'); console.log('Auth module loaded successfully:', typeof auth); console.log('Module exports:', Object.keys(auth)); } catch (e) { console.error('Error loading auth:', e.message, '\nStack:', e.stack); }" && \
    echo "\nListing all files in /usr/src/app recursively:" && \
    find /usr/src/app -type f && \
    echo "\nStarting server..." && \
    NODE_DEBUG=module,internal/modules node index.js