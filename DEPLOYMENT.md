# EduNiti Deployment Guide

This guide covers deploying the complete EduNiti platform across all environments.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Engine     │
│   (Next.js)     │    │   (Supabase)    │    │   (FastAPI)     │
│   Vercel        │    │   Cloud         │    │   AWS/GCP       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Mobile App    │
                    │   (React Native)│
                    │   Expo/App Store│
                    └─────────────────┘
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Supabase account
- Vercel account
- AWS/GCP account (for AI engine)
- Expo account (for mobile app)

## 1. Backend Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 1.2 Database Setup

1. Go to SQL Editor in Supabase dashboard
2. Run the schema from `packages/database/schema.sql`
3. Enable Row Level Security (RLS) policies
4. Set up authentication providers (Google, Phone)

### 1.3 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 2. Frontend Deployment (Vercel)

### 2.1 Prepare for Deployment

```bash
cd apps/web
npm run build
```

### 2.2 Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### 2.3 Environment Variables in Vercel

Add these environment variables in Vercel dashboard:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
SENDGRID_API_KEY=your_sendgrid_key
AI_ENGINE_URL=your_ai_engine_url
```

## 3. AI Engine Deployment

### 3.1 Local Development

```bash
cd apps/ai-engine
pip install -r requirements.txt
python main.py
```

### 3.2 AWS Deployment (Recommended)

#### Using AWS Lambda + API Gateway

1. Install AWS CLI and configure credentials
2. Install Serverless Framework: `npm install -g serverless`
3. Create `serverless.yml`:

```yaml
service: eduniti-ai-engine

provider:
  name: aws
  runtime: python3.9
  region: us-east-1
  environment:
    SUPABASE_URL: ${env:SUPABASE_URL}
    SUPABASE_KEY: ${env:SUPABASE_KEY}

functions:
  api:
    handler: main.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    timeout: 30
    memorySize: 512

plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: true
```

4. Deploy: `serverless deploy`

### 3.3 Google Cloud Deployment

#### Using Cloud Run

1. Install Google Cloud SDK
2. Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

3. Build and deploy:

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/eduniti-ai
gcloud run deploy --image gcr.io/PROJECT_ID/eduniti-ai --platform managed
```

## 4. Mobile App Deployment

### 4.1 Development Setup

```bash
cd apps/mobile
npm install
npx expo start
```

### 4.2 Build for Production

#### Android

```bash
npx expo build:android
```

#### iOS

```bash
npx expo build:ios
```

### 4.3 App Store Deployment

1. Configure app.json with proper bundle identifiers
2. Build production versions
3. Submit to Google Play Store and Apple App Store

## 5. College Plugin Deployment

### 5.1 Build Plugin

```bash
cd packages/plugin
npm run build
```

### 5.2 CDN Deployment

1. Upload built files to CDN (CloudFlare, AWS CloudFront)
2. Update plugin URLs in documentation
3. Test plugin on sample websites

## 6. Environment Configuration

### 6.1 Development

```bash
# Copy environment template
cp env.example .env.local

# Fill in development values
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_dev_anon_key
AI_ENGINE_URL=http://localhost:8000
```

### 6.2 Staging

```bash
# Staging environment variables
NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
AI_ENGINE_URL=your_staging_ai_engine_url
```

### 6.3 Production

```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=your_prod_supabase_url
AI_ENGINE_URL=your_prod_ai_engine_url
```

## 7. Monitoring and Analytics

### 7.1 Application Monitoring

- **Frontend**: Vercel Analytics
- **Backend**: Supabase Dashboard
- **AI Engine**: AWS CloudWatch / Google Cloud Monitoring
- **Mobile**: Expo Analytics

### 7.2 Error Tracking

- **Frontend**: Sentry integration
- **Backend**: Supabase error logs
- **AI Engine**: Custom error logging

### 7.3 Performance Monitoring

- **Web Vitals**: Vercel Speed Insights
- **API Performance**: Supabase metrics
- **Mobile Performance**: Expo Analytics

## 8. Security Checklist

### 8.1 Authentication

- [ ] Enable RLS policies in Supabase
- [ ] Configure OAuth providers
- [ ] Set up phone verification
- [ ] Implement rate limiting

### 8.2 API Security

- [ ] Validate all API inputs
- [ ] Implement CORS policies
- [ ] Use HTTPS everywhere
- [ ] Secure API keys

### 8.3 Data Protection

- [ ] Encrypt sensitive data
- [ ] Implement data backup
- [ ] GDPR compliance
- [ ] Data retention policies

## 9. Scaling Considerations

### 9.1 Database Scaling

- Supabase auto-scaling
- Read replicas for heavy queries
- Database indexing optimization

### 9.2 API Scaling

- Load balancing for AI engine
- Caching strategies
- CDN for static assets

### 9.3 Mobile App Scaling

- App store optimization
- Push notification scaling
- Offline capability

## 10. Maintenance

### 10.1 Regular Updates

- Weekly dependency updates
- Monthly security patches
- Quarterly feature releases

### 10.2 Backup Strategy

- Daily database backups
- Weekly code backups
- Monthly full system backups

### 10.3 Performance Optimization

- Monthly performance reviews
- Quarterly architecture reviews
- Continuous monitoring

## 11. Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   - Check environment variables
   - Verify RLS policies
   - Check network connectivity

2. **AI Engine Timeout**
   - Increase Lambda timeout
   - Optimize model loading
   - Implement caching

3. **Mobile App Build Failures**
   - Check Expo CLI version
   - Verify app.json configuration
   - Clear build cache

### Support Channels

- Documentation: `/docs`
- GitHub Issues: Repository issues
- Email Support: support@eduniti.in
- Community Discord: EduNiti Discord

## 12. Cost Optimization

### 12.1 Supabase Costs

- Monitor database usage
- Optimize queries
- Use connection pooling

### 12.2 Vercel Costs

- Optimize bundle size
- Use edge functions efficiently
- Monitor bandwidth usage

### 12.3 AI Engine Costs

- Implement caching
- Use appropriate instance sizes
- Monitor API usage

This deployment guide ensures a robust, scalable, and maintainable EduNiti platform deployment across all environments.
