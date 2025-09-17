# PathNiti - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
git clone <repository-url>
cd pathniti
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

#### Option A: Use Setup Script (Recommended)
```bash
npm run setup-db
```

#### Option B: Manual Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `src/lib/schema.sql`
4. Insert sample data manually

### 4. Generate PWA Icons
```bash
npm run generate-icons
```

### 5. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## 📱 PWA Features

### Installation
- **Desktop**: Click the install button in the address bar
- **Mobile**: Add to home screen from browser menu
- **Automatic**: Install prompt appears after first visit

### Offline Support
- Quiz questions cached for offline use
- College directory available offline
- Timeline events cached
- Automatic sync when back online

## 🔐 Authentication

### Default Admin Account
After running `npm run setup-db`:
- **Email**: admin@pathniti.in
- **Password**: admin123!

### User Roles
- **Student**: Default role for new users
- **Admin**: Full access to admin panel
- **Counselor**: Limited admin access (future)

## 🗄️ Database Schema

### Core Tables
- `profiles` - User information and preferences
- `colleges` - Government college directory
- `scholarships` - Scholarship information
- `admission_deadlines` - Timeline events
- `notifications` - User notifications
- `quiz_sessions` - Quiz results and recommendations

### Security
- Row Level Security (RLS) enabled
- JWT-based authentication
- Role-based access control
- API rate limiting

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run setup-db     # Initialize database with sample data
npm run generate-icons # Generate PWA icons
```

### Project Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # User dashboard
│   ├── admin/          # Admin panel
│   └── ...
├── components/         # Reusable components
│   ├── ui/            # UI components
│   └── ...
├── lib/               # Utilities and configurations
│   ├── supabase.ts    # Supabase client
│   ├── useAuth.ts     # Authentication hook
│   └── ...
└── middleware.ts      # Next.js middleware
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Supabase Configuration
1. Update CORS settings for your domain
2. Configure authentication providers
3. Set up proper RLS policies
4. Enable real-time subscriptions

## 🔧 Configuration

### PWA Settings
Edit `public/manifest.json` to customize:
- App name and description
- Theme colors
- Icons
- Shortcuts

### Service Worker
The service worker (`public/sw.js`) handles:
- Offline caching
- Background sync
- Push notifications
- Update prompts

### Middleware
Authentication and rate limiting configured in `src/middleware.ts`:
- Protected routes
- Admin access control
- Rate limiting (100 requests/minute)
- CORS headers

## 📊 Features

### ✅ Implemented
- [x] PWA with offline support
- [x] Real-time authentication
- [x] College directory with search
- [x] Scholarship database
- [x] Timeline tracker
- [x] Aptitude quiz
- [x] Admin panel
- [x] Notification system
- [x] Responsive design
- [x] Database integration

### 🚧 In Progress
- [ ] AI recommendation engine
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Video counseling

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify Supabase project is active
# Check RLS policies are enabled
```

#### PWA Not Installing
```bash
# Check manifest.json is accessible
curl http://localhost:3000/manifest.json

# Verify service worker is registered
# Check browser console for errors
```

#### Authentication Issues
```bash
# Clear browser storage
# Check Supabase auth settings
# Verify redirect URLs are configured
```

### Getting Help
1. Check the browser console for errors
2. Verify environment variables
3. Check Supabase dashboard for database issues
4. Review the logs in Vercel dashboard (if deployed)

## 📈 Performance

### Optimization Features
- Static generation for public pages
- Image optimization with Next.js
- Code splitting and lazy loading
- Service worker caching
- Database query optimization

### Monitoring
- Built-in Next.js analytics
- Supabase real-time monitoring
- Error tracking ready (Sentry integration)

## 🔒 Security

### Implemented Security Measures
- Row Level Security (RLS)
- JWT token validation
- API rate limiting
- Input validation
- CORS protection
- HTTPS enforcement

### Best Practices
- Never commit `.env` files
- Use environment variables for secrets
- Regular security updates
- Monitor access logs
- Implement proper error handling

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**PathNiti** - Your Path. Your Future. Simplified. 🎓
