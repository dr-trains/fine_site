#!/bin/bash

# Build the container
echo "Building container..."
docker build -t fine-shyt-ig .

# Run the container with the same environment as Cloud Run
echo "Running container..."
docker run -it --rm \
  -p 8080:8080 \
  -e PORT=8080 \
  -e MONGODB_URI="mongodb+srv://sevendysix:5LYWk4lZOTIXjltN@cluster0.kwecegc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" \
  fine-shyt-ig 