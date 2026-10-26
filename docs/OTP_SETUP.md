# OTP Integration Setup

## Overview
The application supports OTP integration with two implementations:
- **ConsoleOtpService** (dev): Logs OTP codes to console for testing
- **SmsOtpService** (prod): Sends real SMS via configured provider (e.g., Taqnyat)

The system automatically switches between implementations based on the active Spring profile.
## Optional fixed-admin exception

This backend can explicitly enable a fixed-code exception for exactly `+966500000000`, including under the production profile. The account must already exist, have the `ADMIN` role, and be active. The feature does not create accounts, change roles or migrate phone numbers.

This is weak authentication: a reusable four-digit code is not a true one-time password. It is disabled by default. Keep the configured code out of source control, browser configuration and logs.

### Enable on the server

In the backend server's private `.env`, set `FIXED_ADMIN_OTP_ENABLED=true` and set `FIXED_ADMIN_OTP_CODE` to the chosen four ASCII digits. Enter the code using a local editor or your secret-management system; do not place it in a command that will be saved in shell history. Do not commit the `.env` file. Neither variable belongs in Cloudflare Pages or a `VITE_*` variable.

The existing Compose `app` service loads `.env` through `env_file`; no frontend configuration change is required. Preserve the normal SMS credentials: other phone numbers still use the SMS service.

After the backend fix has been committed and pushed, run from the server's backend checkout:

```bash
git pull --ff-only origin main
docker compose up -d --build --no-deps app
docker compose logs --since=2m app
```

These commands assume the existing database and other containers are running. If the rebuilt API is healthy but Nginx returns 502, refresh its upstream address:

```bash
docker compose exec nginx nginx -s reload
```

Do not print `docker compose config` or inspect container environment values when sharing diagnostics, because those outputs can expose secrets. No database migration is added by this feature; it uses the existing hashed-code columns and the previously committed V17 schema support.

### Login behavior

1. Submit the designated phone through the existing OTP request endpoint. The backend validates the active ADMIN account and normal request limits, then creates a five-minute challenge without contacting the SMS provider.
2. Enter the configured fixed code through the existing verification endpoint. A prior request is required. There is no SMS or non-production test-code fallback for this phone while the exception is enabled.
3. Challenges allow the configured number of verification attempts (five by default), expire after the configured TTL and are consumed after successful verification. Requesting a new challenge invalidates all prior active challenges for this phone.
4. Failed-attempt updates commit in an independent transaction so rejected logins cannot roll them back. Requests and verification are serialized with a database row lock on the existing admin.
5. Tokens and refresh-token sessions are issued using the normal authentication flow. The code is not returned in API responses or written to application logs; only a challenge-specific hash is stored.

Set `FIXED_ADMIN_OTP_ENABLED=false` and recreate the app container to disable the exception. Rotating the configured code invalidates outstanding fixed-admin challenges; submit a new request after recreation. Enabling the feature without a valid four-digit code, or with non-positive challenge safety limits, prevents startup rather than silently accepting a fallback code.

The existing admin frontend still uses generic SMS wording, but no SMS is sent for this explicit exception. No frontend changes are required to request or verify the challenge.

### Regression tests

```bash
mvn test -Dtest=FixedAdminOtpServiceTests,AuthServiceFixedAdminTests,SecurityConfigCorsTests
```

These tests use synthetic codes, mock SMS delivery and mock repositories/transaction boundaries. They do not send messages, authenticate against production or apply migrations. Database row-lock behavior still depends on the deployed database and normal application transaction configuration.

## Configuration

### Environment Variables
For production SMS integration:

```bash
# Required
SMS_AUTH_TOKEN=your_sms_api_token

# Optional (with defaults)
SMS_SENDER=GStation
SMS_API_URL=https://api.taqnyat.sa/v1/messages
```

### Configuration Files

**application.yaml** - Base configuration:
```yaml
otp:
  code-length: 4
  ttl-minutes: 5
  resend-cooldown-seconds: 60
  max-attempts-per-day: 5
  sms:
    auth-token: ${SMS_AUTH_TOKEN:}
    sender: ${SMS_SENDER:GStation}
    api-url: ${SMS_API_URL:https://api.taqnyat.sa/v1/messages}
```

**application-dev.yaml** - Development:
```yaml
# No OTP config needed - uses ConsoleOtpService via @Profile("dev")
```

**application-prod.yaml** - Production:
```yaml
# No OTP config needed - uses SmsOtpService via @Profile("prod")
```

## Provider Implementation

### SmsOtpService
Located at: `src/main/java/com/thegamersstation/marketplace/otp/SmsOtpService.java`

Features:
- Active in production profile (`@Profile("prod")`)
- Sends real SMS via configured SMS API
- Uses OkHttp for HTTP requests
- Bilingual OTP messages (Arabic + English)
- Full validation and rate limiting
- Logs all OTP attempts to database
- Stores hashed OTP codes with database-backed expiration and verification-attempt limits

### ConsoleOtpService
Located at: `src/main/java/com/thegamersstation/marketplace/otp/ConsoleOtpService.java`

Features:
- Active in dev profile (`@Profile("dev")`)
- Logs OTP codes to console for testing
- No actual SMS sent
- Supports explicitly configured non-production phone/code test pairs
- Same validation logic as production

## How It Works

1. **Profile-Based Loading**: Spring loads the appropriate service based on active profile:
   - `dev` profile → `ConsoleOtpService`
   - `prod` profile → `SmsOtpService`

2. **OTP Flow**:
   - User requests OTP
   - Validation checks (rate limits, daily limits, cooldown)
   - Generate random 4-digit code
   - Store a SHA-256 hash and expiry in the OTP log table
   - Send SMS via configured API (or log to console in dev)
   - Log attempt to database

3. **Verification**:
   - User submits OTP code
   - Compare the submitted code hash with the latest active database challenge
   - Invalidate on success
   - Return verification result

## API Request Format

The SmsOtpService sends this payload to the SMS provider:

```json
{
  "sender": "GStation",
  "recipients": ["966580020690"],
  "body": "رمز التحقق الخاص بك هو: 1234\nYour verification code is: 1234"
}
```

With headers:
```
Content-Type: application/json
Authorization: YOUR_SMS_AUTH_TOKEN
```

## Testing

### Development Testing
In dev environment, OTP codes are logged to console:
```
🔐 OTP CODE for +966580020690: 1234 (expires in 5 minutes)
```

Non-production test pairs must be configured explicitly. They do not override the dedicated fixed-admin path when that exception is enabled.

### Production Testing
1. Set active profile to production: `SPRING_PROFILE=prod`
2. Set your SMS token: `SMS_AUTH_TOKEN=your_token`
3. Make OTP request to your API
4. Check logs for SMS API responses

## Security Notes

1. **Token Management**: 
   - Never commit `SMS_AUTH_TOKEN` to version control
   - Use environment variables or secret management
   - Rotate tokens periodically

2. **Rate Limiting**:
   - Per-phone: 5 requests/minute
   - Per-IP: 10 requests/minute
   - Daily limit: 5 attempts per phone

3. **Phone Format**:
   - Saudi Arabia numbers: +966XXXXXXXXX
   - Validated using `PhoneValidator`

## Troubleshooting

### OTP not received
- Check SMS API logs in application logs
- Verify `SMS_AUTH_TOKEN` is correct
- Check phone number format
- Verify sender name is approved by SMS provider
- Verify `SMS_API_URL` is correct for your provider

### Wrong implementation loaded
- Check active Spring profile (`SPRING_PROFILE` environment variable)
- Dev profile uses `ConsoleOtpService`
- Prod profile uses `SmsOtpService`
- Check application startup logs for which service is loaded

### Rate limit errors
- Check OTP request logs in database
- Wait for cooldown period (60 seconds)
- Check if daily limit reached

## Monitoring

Monitor these log entries:
- `Sending OTP via SMS to phone: {}` (prod) or `Sending OTP to console for phone: {}` (dev)
- `✅ OTP sent successfully`
- `SMS API error: {}`
- `Failed to send SMS`
- `🔐 OTP CODE for ...` (dev only)
