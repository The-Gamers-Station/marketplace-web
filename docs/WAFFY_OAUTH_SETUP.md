# Waffy OAuth Setup Guide

This guide explains how to configure OAuth authentication for the Waffy API integration.

## Overview

The Waffy API uses OAuth 2.0 Password Grant flow with Basic Authentication for the client credentials.

### Authentication Flow

1. **Get Access Token** (happens automatically)
   - Endpoint: `POST https://dev-auth.waffyapp.com/oauth/token`
   - Headers:
     - `Authorization: Basic <base64(client_id:client_password)>`
     - `Content-Type: application/x-www-form-urlencoded`
   - Body:
     - `grant_type=password`
     - `username=<user_email>`
     - `password=<user_password>`
   - Response: Access token with expiry time

2. **Use Access Token**
   - All Waffy API calls use: `Authorization: Bearer <access_token>`
   - Token is cached and auto-refreshed before expiry

## Configuration Steps

### 1. Get Your Credentials

You need 4 pieces of information from Waffy:

- **Client ID**: OAuth client identifier
- **Client Password**: OAuth client secret
- **Username**: Your Waffy account email
- **Password**: Your Waffy account password

### 2. Generate Basic Auth Header

The `Authorization` header for the OAuth token endpoint must be in the format:
```
Basic <base64(client_id:client_password)>
```

#### Option A: Use the PowerShell Script

```powershell
.\scripts\generate-waffy-auth.ps1 -ClientId "your-client-id" -ClientPassword "your-client-secret"
```

This will:
- Generate the correct Base64 encoded string
- Display the full Authorization header
- Copy it to your clipboard

#### Option B: Manual Generation

1. Combine client_id and client_password with a colon: `client_id:client_password`
2. Base64 encode the string
3. Add "Basic " prefix

**Example:**
```
client_id: myapp
client_password: secret123

Combined: myapp:secret123
Base64: bXlhcHA6c2VjcmV0MTIz
Final: Basic bXlhcHA6c2VjcmV0MTIz
```

### 3. Set Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
# Waffy OAuth Configuration
WAFFY_BASE_URL=https://dev-api.waffyapp.com
WAFFY_AUTH_URL=https://dev-auth.waffyapp.com
WAFFY_ADMIN_USER_ID=your-admin-user-id

# User credentials for password grant
WAFFY_OAUTH_USERNAME=your-email@example.com
WAFFY_OAUTH_PASSWORD=your-password

# Client credentials (Basic Auth header)
WAFFY_OAUTH_CLIENT_AUTH=Basic <your-base64-encoded-client-credentials>
```

### 4. Verify Configuration

Start the application and check the logs:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Look for:
```
INFO  c.t.m.order.WaffyService - Fetching new Waffy OAuth token
INFO  c.t.m.order.WaffyService - Waffy OAuth token obtained successfully, expires in 3600 seconds
```

## How It Works

The `WaffyService` automatically handles OAuth authentication:

1. **First API Call**: Fetches OAuth token
2. **Subsequent Calls**: Uses cached token
3. **Token Refresh**: Auto-refreshes 5 minutes before expiry
4. **Error Handling**: Retries token fetch on failure

## Example cURL Request (for testing)

```bash
curl --location 'https://dev-auth.waffyapp.com/oauth/token' \
--header 'Accept: application/json' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Authorization: Basic <your-base64-credentials>' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'username=your-email@example.com' \
--data-urlencode 'password=your-password'
```

Expected response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read write"
}
```

## Troubleshooting

### Invalid Client Credentials
- **Error**: `401 Unauthorized` or `invalid_client`
- **Fix**: Verify your Base64 encoded client credentials are correct

### Invalid User Credentials
- **Error**: `400 Bad Request` or `invalid_grant`
- **Fix**: Check your username and password

### Token Expired
- **Solution**: The system auto-refreshes tokens, but you can force refresh by restarting the service

## Security Notes

⚠️ **Never commit the `.env` file to version control!**

- Add `.env` to `.gitignore`
- Use `.env.example` as a template only
- Rotate credentials regularly
- Use different credentials for dev/staging/production

## Support

For issues with Waffy API credentials, contact Waffy support.
For integration issues, check the application logs in `logs/` directory.
