# Production Deployment Checklist

## Pre-Deployment

### Environment Variables (Vercel)
- [ ] DATABASE_URL
- [ ] DIRECT_URL
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] NEXT_PUBLIC_APP_URL
- [ ] AI_PROVIDER (optional, defaults to 'mock')
- [ ] OPENAI_API_KEY (if using OpenAI)
- [ ] GROQ_API_KEY (if using Groq)
- [ ] ANTHROPIC_API_KEY (if using Claude)
- [ ] GEMINI_API_KEY (if using Gemini)

### Database
- [ ] Supabase project created
- [ ] PostgreSQL connection string obtained
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify tables created in Supabase dashboard

### Supabase Auth
- [ ] Auth enabled in Supabase dashboard
- [ ] Email auth provider configured
- [ ] Email templates customized (optional)
- [ ] Redirect URLs configured
- [ ] Rate limiting configured

### Code Quality
- [ ] No console.logs in production code
- [ ] TypeScript errors resolved: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] All tests pass (if you have tests)

## Deployment

### Vercel Setup
- [ ] Connect GitHub repository
- [ ] Configure environment variables
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `.next`
- [ ] Deploy preview

### Post-Deployment
- [ ] Test auth flow (signup, login, logout)
- [ ] Test protected routes
- [ ] Test API endpoints
- [ ] Test AI generation (if enabled)
- [ ] Check error monitoring
- [ ] Monitor performance
- [ ] Test mobile responsiveness

## Security

- [ ] Secrets not exposed in client code
- [ ] API routes protected with authentication
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection (Next.js handles this)
- [ ] CSRF protection enabled

## Monitoring

- [ ] Error tracking setup (Sentry, etc.)
- [ ] Analytics configured
- [ ] Database query monitoring
- [ ] API response time monitoring
- [ ] User session tracking

## Documentation

- [ ] README updated with deployment instructions
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Contributing guidelines updated
