# Supabase Keep-Alive System

This document explains how to use the Supabase keep-alive system to prevent your database from going to sleep during development and production.

## 🎯 Purpose

Supabase free tier databases can go to sleep after periods of inactivity. This keep-alive system ensures your database stays active by sending periodic requests to maintain the connection.

## 📁 Files Overview

### 1. API Endpoint
- **File**: `apps/web/src/app/api/keep-alive/route.ts`
- **Purpose**: Next.js API route that pings Supabase
- **URL**: `https://your-domain.com/api/keep-alive`

### 2. Node.js Script
- **File**: `scripts/keep-alive.js`
- **Purpose**: Standalone script for continuous keep-alive
- **Usage**: `npm run keep-alive`

### 3. Cron Job Script
- **File**: `scripts/cron-keep-alive.sh`
- **Purpose**: Bash script for scheduled keep-alive
- **Usage**: Add to crontab for automated execution

## 🚀 Usage Methods

### Method 1: Manual API Calls
```bash
# Test the endpoint
curl https://your-domain.com/api/keep-alive

# Expected response
{
  "status": "alive",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Supabase connection kept alive",
  "data": "Connection successful"
}
```

### Method 2: Node.js Script (Recommended for Development)
```bash
# Run locally (default: localhost:3001)
npm run keep-alive

# Run for production
npm run keep-alive:prod

# Custom URL and interval
node scripts/keep-alive.js --url https://your-app.vercel.app --interval 300000
```

**Script Features:**
- ✅ Automatic retry on failure
- ✅ Success/error counting
- ✅ Graceful shutdown (Ctrl+C)
- ✅ Configurable interval (default: 5 minutes)
- ✅ Detailed logging

### Method 3: Cron Job (Recommended for Production)
```bash
# Make script executable
chmod +x scripts/cron-keep-alive.sh

# Add to crontab (runs every 5 minutes)
crontab -e

# Add this line:
*/5 * * * * /path/to/your/project/scripts/cron-keep-alive.sh
```

**Cron Features:**
- ✅ Automated execution
- ✅ Log file with timestamps
- ✅ Error handling and reporting
- ✅ Lightweight and efficient

## ⚙️ Configuration

### Environment Variables
Ensure these are set in your environment:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Customization Options

#### Node.js Script
```bash
# Custom interval (in milliseconds)
node scripts/keep-alive.js --interval 600000  # 10 minutes

# Custom URL
node scripts/keep-alive.js --url https://your-custom-domain.com
```

#### Cron Job
Edit `scripts/cron-keep-alive.sh` to modify:
- `KEEP_ALIVE_URL`: Your application URL
- `LOG_FILE`: Log file location
- Cron schedule: Change `*/5 * * * *` to your preferred interval

## 📊 Monitoring

### Log Files
- **Node.js Script**: Console output with timestamps
- **Cron Job**: `logs/keep-alive.log` file

### Success Indicators
```bash
✅ [2024-01-15T10:30:00.000Z] Keep-alive successful (1 total)
   📝 Supabase connection kept alive
```

### Error Indicators
```bash
❌ [2024-01-15T10:30:00.000Z] Keep-alive failed: Request timeout
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
# Ensure you're in the project root
cd /path/to/your/project
npm install
```

#### 2. "Supabase configuration missing"
- Check environment variables are set
- Verify Supabase URL and keys are correct

#### 3. "Request timeout"
- Check if your application is running
- Verify the URL is accessible
- Check network connectivity

#### 4. Cron job not working
```bash
# Check if cron is running
sudo service cron status

# Check cron logs
tail -f /var/log/cron

# Test script manually
./scripts/cron-keep-alive.sh
```

### Debug Mode
```bash
# Run with verbose output
DEBUG=1 node scripts/keep-alive.js
```

## 🚀 Production Deployment

### Vercel Deployment
The keep-alive endpoint is automatically deployed with your Next.js application.

### External Monitoring
Consider using external services for production:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Website monitoring
- **StatusCake**: Uptime and performance monitoring

### Recommended Production Setup
1. **Deploy your app** to Vercel
2. **Set up cron job** on a server or use external monitoring
3. **Monitor logs** regularly
4. **Set up alerts** for failures

## 📈 Performance Impact

### Minimal Resource Usage
- **API Endpoint**: ~50ms response time
- **Database Query**: Simple SELECT with LIMIT 1
- **Network**: Single HTTP request every 5 minutes
- **Storage**: No data storage, just connection test

### Cost Considerations
- **Free Tier**: Well within Supabase free tier limits
- **Bandwidth**: Negligible impact
- **Database**: Minimal query load

## 🔒 Security Notes

- Uses public Supabase anon key (safe for client-side)
- No sensitive data exposed
- Simple SELECT query with no data modification
- Rate limiting handled by Supabase

## 📝 Best Practices

1. **Development**: Use Node.js script for testing
2. **Production**: Use cron job or external monitoring
3. **Monitoring**: Check logs regularly
4. **Backup**: Have multiple keep-alive methods
5. **Testing**: Test keep-alive before going live

## 🆘 Support

If you encounter issues:
1. Check the logs first
2. Verify environment variables
3. Test the API endpoint manually
4. Check Supabase dashboard for connection status

---

**Remember**: Keep-alive is essential for maintaining database connections, especially during development and testing phases!
