# TravelTogether

A social networking platform for travelers to find companions with shared interests during their journey.

**Service Link:** https://togetrip.vercel.app

## 🚀 Project Overview

TravelTogether is a platform that allows travelers to discover other travelers nearby, send and receive travel companion requests, and communicate through real-time chat.

## 📋 Key Features

- 🗺️ **Location-based Discovery**: Find travelers by same city or customizable radius with distance filtering
- 💬 **Real-time Chat**: Exchange messages with travel companions in real-time
- 📝 **Travel Requests**: Send and manage travel companion requests
- 👤 **Profile Management**: Set personal information and travel preferences
- 📱 **Responsive Design**: Support for both mobile and desktop environments
- 🔐 **Social Login**: Easy authentication through Google OAuth

## 🛠️ Tech Stack

### Main Project (Next.js)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Maps Integration:** Google Maps API
- **Backend Services:** Supabase (Auth, Database, Storage, Realtime)
- **Package Manager:** pnpm
- **Testing:** Jest, React Testing Library, Playwright (E2E)

## 📱 Screenshots

<!-- prettier-ignore-start -->
| Main Home | Travel Requests |
| :---: | :---: |
| <img width="400" alt="Main Home" src="https://github.com/user-attachments/assets/51d231f5-9d0f-4b14-bec3-397bd330e0df"> | <img width="400" alt="Travel Requests" src="https://github.com/user-attachments/assets/805ca1b8-abee-4913-8a1d-7c7d60e152e7"> |
| **Chat** | **Profile** |
| <img width="400" alt="Chat" src="https://github.com/user-attachments/assets/dec0cacb-ea42-4439-96ca-cfea440125f4"> | <img width="400" alt="Profile" src="https://github.com/user-attachments/assets/5fadadf8-733f-4065-a198-5b0fa8db1a13"> |
<!-- prettier-ignore-end -->

## 🏗️ Project Structure

### Main Project (Next.js)

```
nextjs/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── home/
│   │   │   ├── chat/
│   │   │   ├── request/
│   │   │   ├── profile/
│   │   │   └── layout.tsx
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   ├── signup/
│   │   │   └── callback/
│   │   ├── api/
│   │   └── layout.tsx
│   ├── features/              # Domain-specific feature modules
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── home/
│   │   ├── profile/
│   │   ├── request/
│   │   └── shared/            # Shared features
│   ├── components/            # Common components
│   ├── lib/                   # Utilities and configurations
│   ├── providers/             # Context providers
│   ├── stores/                # State management
│   └── hooks/                 # Common hooks
├── e2e/                       # E2E tests
├── migrations/                # Supabase migrations
└── package.json
```
