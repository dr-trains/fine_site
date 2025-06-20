#!/bin/bash

# Exit on any error
set -e

echo "=== Starting Fine Shyt IG server ==="
echo "Current working directory: $(pwd)"
echo "Directory contents:"
ls -la
echo ""

echo "=== Environment Information ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PORT value: $PORT"
echo "MongoDB URI (masked): ${MONGODB_URI//:*@/:***@}"
echo ""

echo "=== Checking Dependencies ==="
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found"
    exit 1
fi

if [ ! -f "index.js" ]; then
    echo "Error: index.js not found"
    exit 1
fi

echo "=== Starting Node.js Application ==="
# Use exec to replace shell with node process
exec node index.js 