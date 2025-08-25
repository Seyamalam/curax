# Environment Variables Documentation

This document provides a comprehensive analysis of all environment variables used in the Curax healthcare chatbot application.

## Required Environment Variables

### 🔐 Authentication & Security

#### AUTH_SECRET
- **Required**: ✅ Yes
- **Purpose**: Secret key for NextAuth.js authentication
- **Usage**: Used in `app/(auth)/auth.ts` and `middleware.ts`
- **How to generate**: `openssl rand -base64 32` or visit https://generate-secret.vercel.app/32
- **Example**: `AUTH_SECRET=your-32-character-secret-here`

### 🗄️ Database & Storage

#### POSTGRES_URL
- **Required**: ✅ Yes
- **Purpose**: PostgreSQL database connection string
- **Usage**: Extensively used throughout the application for database operations
- **Files using it**: 
  - `drizzle.config.ts`
  - All API routes in `app/(chat)/api/`
  - All admin pages in `app/admin/`
  - Database queries in `lib/db/`
- **Example**: `POSTGRES_URL=postgresql://username:password@localhost:5432/database_name`

#### BLOB_READ_WRITE_TOKEN
- **Required**: ✅ Yes
- **Purpose**: Vercel Blob storage access token for file uploads
- **Usage**: Used by `@vercel/blob` package in `app/(chat)/api/files/upload/route.ts`
- **Setup**: Instructions at https://vercel.com/docs/storage/vercel-blob
- **Example**: `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token_here`

#### REDIS_URL
- **Required**: ⚠️ Optional (for resumable streams)
- **Purpose**: Redis connection for resumable stream functionality
- **Usage**: Used in `app/(chat)/api/chat/route.ts` for resumable streams
- **Behavior when missing**: Resumable streams are disabled, application continues to work
- **Setup**: Instructions at https://vercel.com/docs/redis
- **Example**: `REDIS_URL=redis://localhost:6379`

### 🤖 AI & API Integrations

#### OPENROUTER_API_KEY
- **Required**: ✅ Yes
- **Purpose**: OpenRouter API key for AI chat models (Gemini 2.5 Flash)
- **Usage**: Used in `lib/ai/providers.ts` for primary chat functionality
- **Setup**: Get API key from OpenRouter
- **Example**: `OPENROUTER_API_KEY=sk-or-your-api-key-here`

#### GROQ_API_KEY
- **Required**: ✅ Yes
- **Purpose**: Groq API key for speech-to-text functionality
- **Usage**: Used in `app/(chat)/api/speech-to-text/route.ts`
- **Models used**: `distil-whisper-large-v3-en`
- **Setup**: Get API key from Groq Console
- **Example**: `GROQ_API_KEY=gsk_your-groq-api-key-here`

#### XAI_API_KEY
- **Required**: ❌ No (not currently used)
- **Purpose**: Listed in .env.example but no active usage found in codebase
- **Status**: May be intended for future xAI integration
- **Action**: Can be omitted unless planning to use xAI models

### 📱 Push Notifications

#### NEXT_PUBLIC_VAPID_PUBLIC_KEY
- **Required**: ✅ Yes (for push notifications)
- **Purpose**: VAPID public key for web push notifications
- **Usage**: Used in `components/PushManager.tsx` and `lib/notifications/sendMedicationReminders.ts`
- **Note**: Must be prefixed with `NEXT_PUBLIC_` to be available in browser
- **Example**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key`

#### VAPID_PRIVATE_KEY
- **Required**: ✅ Yes (for push notifications)
- **Purpose**: VAPID private key for web push notifications
- **Usage**: Used in `lib/notifications/sendMedicationReminders.ts`
- **Security**: Keep this secret, server-side only
- **Example**: `VAPID_PRIVATE_KEY=your-vapid-private-key`

## System & Development Variables

### NODE_ENV
- **Required**: 🔧 Automatic
- **Purpose**: Node.js environment (development/production/test)
- **Usage**: Used in `lib/constants.ts` for environment detection
- **Values**: `development`, `production`, `test`

### PORT
- **Required**: ❌ No
- **Purpose**: Server port number
- **Usage**: Used in `playwright.config.ts`
- **Default**: 3000
- **Example**: `PORT=3000`

## Testing & CI Variables

### Playwright Testing
These variables are used for automated testing:

- `PLAYWRIGHT_TEST_BASE_URL` - Base URL for Playwright tests
- `PLAYWRIGHT` - Flag indicating Playwright environment
- `CI_PLAYWRIGHT` - Flag for CI Playwright runs
- `CI` - Standard CI environment flag

## Updated .env.example

Based on this analysis, the `.env.example` file should include:

```bash
# Generate a random secret: https://generate-secret.vercel.app/32 or `openssl rand -base64 32`
AUTH_SECRET=****

# PostgreSQL database connection string
# Instructions: https://vercel.com/docs/storage/vercel-postgres/quickstart
POSTGRES_URL=****

# Vercel Blob storage token for file uploads
# Instructions: https://vercel.com/docs/storage/vercel-blob
BLOB_READ_WRITE_TOKEN=****

# Redis connection for resumable streams (optional)
# Instructions: https://vercel.com/docs/redis
REDIS_URL=****

# OpenRouter API key for AI chat models
# Get your API key from OpenRouter
OPENROUTER_API_KEY=****

# Groq API key for speech-to-text functionality
# Get your API key from Groq Console
GROQ_API_KEY=****

# VAPID keys for push notifications
# Generate VAPID keys for web push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=****
VAPID_PRIVATE_KEY=****

# XAI API Key (currently not used in codebase)
# XAI_API_KEY=****
```

## Setup Priority

### Minimum viable setup:
1. `AUTH_SECRET`
2. `POSTGRES_URL`
3. `OPENROUTER_API_KEY`

### Full functionality:
1. All minimum viable variables
2. `GROQ_API_KEY` (for speech-to-text)
3. `BLOB_READ_WRITE_TOKEN` (for file uploads)
4. `NEXT_PUBLIC_VAPID_PUBLIC_KEY` & `VAPID_PRIVATE_KEY` (for push notifications)
5. `REDIS_URL` (for enhanced streaming performance)

## Missing Variables Analysis

The current `.env.example` is missing these actively used variables:
- `OPENROUTER_API_KEY`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

These should be added to ensure developers have a complete reference for setting up the application.