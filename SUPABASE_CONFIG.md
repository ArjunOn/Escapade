# Supabase Configuration for Escapade

## Disable Email Confirmation

Since Escapade doesn't require email confirmation, follow these steps to completely disable it in your Supabase project:

### Option 1: Disable Confirmation Emails (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. Find "Confirm signup" template
5. **Disable** the template or set it to not send

### Option 2: Enable Auto-Confirm (Alternative)

1. Go to **Authentication** → **Settings**  
2. Under "Email Auth", look for **"Enable email confirmations"**
3. **Uncheck** this option to auto-confirm all signups

### Current Implementation

The app currently handles email rate limit errors gracefully:
- ✅ Users can sign up even if email sending fails
- ✅ No email confirmation required to access the app
- ✅ Rate limit errors are suppressed (see `src/lib/auth-service.ts`)

### Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Password Requirements

- Minimum 8 characters
- At least one letter
- At least one number

### Username Requirements

- 3-20 characters
- Letters, numbers, and underscores only
