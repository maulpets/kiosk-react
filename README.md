# Kiosk React App

WElcome!


A modern multipage React web application built with Next.js, designed specifically for React Native WebView integration. This app features a comprehensive folder structure, state management, API integration, and seamless communication with React Native apps.

## 🚀 Features

- **Multipage Navigation**: Built with Next.js App Router for seamless page transitions
- **React Native WebView Integration**: Bidirectional messaging system for native app communication
- **State Management**: Context-based state management with TypeScript
- **API Client**: Robust HTTP client with error handling and type safety
- **Theme Support**: Light/dark theme with system preference detection
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── layout/           # Layout components (Header, PageLayout, etc.)
│   ├── ui/               # Generic UI components
│   └── forms/            # Form components
├── hooks/                # Custom React hooks
│   ├── useWebViewBridge.ts # WebView communication hook
│   └── useApi.ts         # API interaction hooks
├── lib/                  # Core library functions
│   ├── api/              # API client and utilities
│   ├── webview/          # WebView bridge implementation
│   └── utils/            # Utility functions
├── store/                # State management
│   └── AppContext.tsx    # Global app context
├── types/                # TypeScript type definitions
│   ├── index.ts          # Core types
│   └── webview.ts        # WebView message types
└── constants/            # App constants and configuration
    └── index.ts          # Routes, API endpoints, etc.
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + useReducer
- **HTTP Client**: Fetch API with custom wrapper
- **Development**: ESLint, Prettier (configured)

## 🚦 Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 React Native Integration

This app is designed to run inside a React Native WebView. The WebView bridge provides:

### Message Communication

```typescript
// Send message to React Native
sendToNative('ACTION_NAME', { data: 'payload' });

// Listen for messages from React Native
onNativeMessage('NATIVE_ACTION', (message) => {
  console.log('Received from native:', message);
});
```

### Connection Status

The app automatically detects whether it's running in a React Native WebView or standalone mode.

## 🎨 Theming

The app supports light and dark themes:

```typescript
const { setTheme } = useAppContext();
setTheme('dark'); // or 'light'
```

## 🔧 API Integration

### Using the API Client

```typescript
import { useApiGet, useApiPost } from '@/hooks';

// GET request
const { data, loading, error, get } = useApiGet('/api/kiosk-employee-data');

// POST request  
const { post } = useApiPost('/api/auth');
await post({ employeeId: '12345', password: '1234' });
```

### Custom API Calls

```typescript
import { apiClient } from '@/lib/api/client';

const response = await apiClient.get('/api/custom-endpoint');
```

## 📄 Available Pages

- **Home** (`/`): Landing page with feature overview
- **Setup** (`/setup`): Organization setup
- **Login** (`/login`): Employee login with number pad
- **Dashboard** (`/dashboard`): Main kiosk interface with operations
- **Timecard** (`/timecard`): View timecard data
- **Tips** (`/tips`): Helpful tips and information

## 🔄 State Management

Global state is managed through React Context:

```typescript
const { state, setUser, setTheme, setError } = useAppContext();
```

State includes:
- User information
- Theme preference
- Loading states
- Error messages
- Native connection status

## 🛡️ Error Handling

- API errors are automatically caught and displayed
- Network errors are handled gracefully
- Component error boundaries prevent app crashes

## 📝 Development Guidelines

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Update navigation in `src/components/layout/Header.tsx`
4. Add route constant in `src/constants/index.ts`

### Adding New API Endpoints

1. Create route handler in `src/app/api/`
2. Add endpoint constant in `src/constants/index.ts`
3. Create custom hook if needed in `src/hooks/`

### WebView Integration

1. Use `useWebViewBridge` hook for communication
2. Define message types in `src/types/webview.ts`
3. Add message type constants in `src/constants/index.ts`

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=your-api-url
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Add proper error handling
4. Include type definitions
5. Test WebView integration

## 📄 License

This project is licensed under the MIT License.
