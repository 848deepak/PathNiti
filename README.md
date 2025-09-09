# PathNiti - One-Stop Personalized Career & Education Advisor

PathNiti is a comprehensive platform designed to help Indian students (Class 10/12 and undergraduates) make informed decisions about their education and career paths.

## 🎯 Mission

To empower students with personalized career guidance, government college information, and streamlined admission processes through an AI-driven platform.

## ✨ Key Features

- **Personalized Career Guidance**: AI-powered recommendations based on aptitude and interests
- **Government College Directory**: Comprehensive database of government colleges with location-based search
- **Aptitude & Interest Assessment**: Comprehensive quiz system to identify suitable career paths
- **Timeline Tracker**: Never miss important deadlines for admissions and scholarships
- **Career Pathway Visualizer**: Interactive flowcharts showing degree-to-career progression
- **Mobile-First Design**: Cross-platform mobile app for accessibility
- **Offline Support**: PWA capabilities for areas with limited internet connectivity

## 🏗️ Architecture

This project uses a monorepo structure with the following components:

- **Frontend**: Next.js web application
- **Mobile**: React Native cross-platform app
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI Engine**: Python FastAPI service
- **Admin Panel**: Next.js admin dashboard
- **College Plugin**: Embeddable JavaScript widget

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Mobile**: React Native, Expo
- **Backend**: Supabase, PostgreSQL
- **AI/ML**: Python, FastAPI, Scikit-learn
- **Maps**: Google Maps API
- **Notifications**: Firebase Cloud Messaging, Twilio
- **Deployment**: Vercel, Supabase Cloud

## 📁 Project Structure

```
pathniti/
├── apps/
│   ├── web/                 # Next.js web application
│   ├── mobile/              # React Native mobile app
│   ├── admin/               # Admin panel
│   └── ai-engine/           # Python AI service
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── database/            # Database schemas and types
│   ├── utils/               # Shared utilities
│   └── plugin/              # College plugin
└── docs/                    # Documentation
```

## 🛠️ Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pathniti
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

## 📱 Getting Started

1. **Web Application**: Visit `http://localhost:3000`
2. **Mobile App**: Run `npm run mobile` in the mobile directory
3. **Admin Panel**: Visit `http://localhost:3001`
4. **AI Engine**: Visit `http://localhost:8000`

## 🎨 Design System

PathNiti follows a modern, accessible design system with:
- **Colors**: Indian-inspired color palette with accessibility in mind
- **Typography**: Clear, readable fonts optimized for mobile
- **Components**: Reusable UI components built with Shadcn/ui
- **Icons**: Consistent iconography using Lucide React

## 🔐 Authentication

- Email/Password authentication
- Google OAuth integration
- Phone OTP verification
- Role-based access control (Student, Admin, Counselor)

## 📊 Data Sources

- Government college databases
- UGC/AICTE official data
- Scholarship portals
- Career guidance resources
- Industry job market data

## 🌍 Localization

- Primary language: English
- Regional language support planned
- Location-based content customization

## 📈 Roadmap

### Phase 1 (MVP - 3 months)
- [x] Project setup and architecture
- [ ] User authentication and profiles
- [ ] Basic aptitude quiz
- [ ] Government college directory
- [ ] Timeline tracker

### Phase 2 (6 months)
- [ ] AI recommendation engine
- [ ] Mobile application
- [ ] Notification system
- [ ] Admin panel

### Phase 3 (1 year)
- [ ] College plugin
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Integration with government portals

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@eduniti.in or join our community Discord.

---

**EduNiti** - Your Path. Your Future. Simplified. 🎓
