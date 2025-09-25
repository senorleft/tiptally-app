# 🔒 Security & Deployment Guide for TipTally

## Overview

This guide covers the security enhancements and deployment steps for your TipTally app on Firebase Hosting.

## Security Implementations

### 1. Security Headers (firebase.json)

✅ **Implemented**: The following security headers are now configured:

- **HSTS**: `max-age=31536000; includeSubDomains; preload` (1 year)
- **X-Content-Type-Options**: `nosniff` (prevents MIME sniffing)
- **X-Frame-Options**: `DENY` (prevents clickjacking)
- **CSP**: Restrictive Content Security Policy allowing only same-origin resources

### 2. Log Cleanup Files

✅ **Created** in `/public/`:

- `robots.txt` - Discourages WordPress probing with specific disallows
- `apple-touch-icon.png` - 1x1 transparent PNG (70 bytes)
- `apple-touch-icon-precomposed.png` - Identical to above
- `favicon.ico` - Minimal favicon to prevent 404s

### 3. Cloud Functions Security

✅ **Created** secure function example with:

- Input sanitization using `dompurify`
- Proper error handling and logging
- CORS support
- TypeScript for type safety

## Deployment Instructions

### Prerequisites

1. **Firebase CLI**: Install if not already installed
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize project** (if not done):
   ```bash
   firebase init
   # Select Hosting and Functions
   # Use existing project: tiptally-app
   ```

### Step 1: Build Your Next.js App

Since you're using Firebase Hosting, you need to build and export your Next.js app:

```bash
# Add to your package.json scripts if not present:
# "export": "next build && next export"

npm run build
npm run export  # This creates the 'out' directory
```

### Step 2: Deploy Functions (Optional)

If you want to use the security functions:

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Step 3: Deploy Hosting with Security Headers

```bash
# Deploy hosting with the new security configurations
firebase deploy --only hosting
```

### Step 4: Verify Security Headers

After deployment, test your security headers:

```bash
curl -I https://tiptally.app
```

You should see the security headers in the response.

## Testing the Security Function

Test the input sanitization function:

```bash
# Replace YOUR-PROJECT-ID and REGION with your actual values
curl -X POST \
  https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/secureInputFunction \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello <script>alert(\"xss\")</script> World!"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "original": "Hello <script>alert(\"xss\")</script> World!",
    "sanitized": "Hello  World!",
    "wasModified": true,
    "processedAt": "2024-XX-XX..."
  }
}
```

## File Structure

Your project now includes:

```
tiptally-app/
├── firebase.json              # Security headers + hosting config
├── public/
│   ├── robots.txt            # WordPress probe deterrent
│   ├── apple-touch-icon.png  # 404 prevention
│   ├── apple-touch-icon-precomposed.png
│   └── favicon.ico           # 404 prevention
├── functions/
│   ├── package.json          # Function dependencies
│   ├── tsconfig.json         # TypeScript config
│   └── src/
│       └── index.ts          # Secure input function
└── out/                      # Next.js export (created on build)
```

## Security Benefits

1. **Reduced 404 Warnings**: Common probe files now return 200 OK
2. **Enhanced Headers**: Protection against XSS, clickjacking, and MIME attacks
3. **Input Sanitization**: Example function for secure user input handling
4. **HTTPS Enforcement**: HSTS header forces secure connections

## Maintenance Notes

- Security headers apply to all routes automatically
- The log cleanup files require no maintenance
- Update DOMPurify in functions regularly for latest security fixes
- Monitor Firebase logs for any remaining 404s to add additional placeholder files

## Next Steps

1. Deploy and test all components
2. Monitor logs for any remaining security issues
3. Consider adding rate limiting to Cloud Functions if needed
4. Regularly update dependencies for security patches

---

*Security implemented for the chill tip calculator that just works* ✨