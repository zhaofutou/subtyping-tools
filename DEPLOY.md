# Virus Typing Tools — Deployment Guide

## Prerequisites
- Docker installed ([docs.docker.com/get-docker](https://docs.docker.com/get-docker/))

## Step 1: Clone the repo

```bash
git clone -b docker https://github.com/zhaofutou/subtyping-tools.git
cd subtyping-tools
```

## Step 2: Build and start

```bash
docker compose up --build -d
```

That's it. Open http://localhost:8080 in your browser.

## Common Commands

```bash
# Stop the app
docker compose down

# Restart the app
docker compose restart

# Rebuild after code changes
docker compose up --build -d

# View logs
docker compose logs -f

# Check status
docker compose ps
```

## Optional: Expose on network

The app listens on port 8080 by default. To change it, edit `docker-compose.yml`:

```yaml
ports:
  - "80:80"    # use port 80 instead
```

Then restart:
```bash
docker compose up --build -d
```

## Optional: Run on a remote server

Same steps on any Linux/Mac/Windows machine with Docker:

```bash
ssh user@remote-server
git clone -b docker https://github.com/zhaofutou/subtyping-tools.git
cd subtyping-tools
docker compose up --build -d
```

Access from any device on the network: http://remote-server-ip:8080
