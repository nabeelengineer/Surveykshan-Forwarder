# Surveykshan Data Forwarder

A Node.js application that fetches data from the EnggEnv server and forwards it to the Surveykshan API.

## Features

- **Automatic Authentication**: Logs into EnggEnv server and manages tokens
- **Device Mapping**: Maps EnggEnv device IDs to Surveykshan device IDs
- **Error Handling**: Robust error handling with retry logic
- **Token Refresh**: Automatic JWT token refresh
- **Health Monitoring**: Built-in health check endpoint

## Deployment on Render

This application is configured to deploy on Render.com as a web service.

### Environment Variables

Set these in your Render dashboard:

```bash
# Server Configuration
SERVER_BASE_URL=https://staging.enggenv.com/api/v1
LOGIN_EMAIL=your_email@example.com
LOGIN_PASSWORD=your_password

# Surveykshan API Configuration
SURVEYKSHAN_API_URL=http://your-server.com:5003/api/string
SURVEYKSHAN_API_KEY=your_api_key_here

# Server Port (optional, defaults to 3000)
PORT=3000
```

### Health Check

The application provides a health check endpoint:
```
GET /health
```

## Adding Devices After Deployment

To add new devices after deployment:

1. Go to your Render dashboard
2. Navigate to your service
3. Click on "Environment" tab
4. Add new device mapping in `deviceMapping.json` format
5. Redeploy the service

Alternatively, you can connect via SSH and edit the file directly:
```bash
# Connect to your service
render ssh

# Edit device mapping
nano deviceMapping.json

# Restart the service
# (Render will auto-restart on file changes)
```

## Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env

# Run locally
npm run dev
```

## API Endpoints

- `GET /health` - Health check
- Background process runs every 15 minutes to forward data

## Monitoring

- Check Render dashboard for logs
- Monitor health check endpoint
- Set up alerts for downtime
