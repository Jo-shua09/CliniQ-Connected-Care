# CliniQ

A modern, privacy-first health monitoring platform that enables connected healthcare with consent-based data sharing. Monitor vitals, share health data with family and caregivers, and stay connected to your health network.

## 🚀 Features

- **Health Network**: Monitor loved ones with consent-based access to health data
- **Live Vitals**: Real-time health metrics from connected devices
- **Privacy First**: Full control over who sees your health information
- **HIPAA Compliant**: Meets healthcare privacy standards
- **End-to-end Encryption**: Secure data transmission and storage
- **24/7 AI Health Assistant**: Intelligent health insights and recommendations
- **Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Framework**: ShadCN UI components
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM
- **State Management**: TanStack Query for server state
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cliniq
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📱 Usage

### Pages Overview

- **Landing Page** (`/`): Welcome page with feature overview
- **Authentication**:
  - Login (`/login`): User sign-in
  - Signup (`/signup`): User registration
- **Dashboard** (`/dashboard`): Main health monitoring interface
- **Network** (`/network`): Manage health connections and permissions
- **Chat** (`/chat`): Communicate with healthcare providers and family
- **Settings** (`/settings`): User preferences and account management

### Key Components

- **Device Status**: Monitor connected health devices
- **Health Score**: Overall wellness metrics
- **Vital Cards**: Individual health metric displays
- **AI Assistant**: Intelligent health insights
- **Modals**: Add connections, log vitals, manage permissions

### Tailwind Configuration

Custom design tokens are defined in `tailwind.config.ts`:

- Primary colors: Health-focused blue tones
- Secondary colors: Supportive green accents
- Typography: Outfit and Space Grotesk fonts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Built with ❤️ for better healthcare connectivity
