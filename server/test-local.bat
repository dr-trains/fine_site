@echo off
echo Building container...
docker build -t fine-shyt-ig .

echo Running container...
docker run -it --rm ^
  -p 3000:8080 ^
  -e PORT=8080 ^
  -e MONGODB_URI="mongodb+srv://sevendysix:5LYWk4lZOTIXjltN@cluster0.kwecegc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" ^
  fine-shyt-ig 