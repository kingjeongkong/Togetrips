# Togetrips

A social networking platform for travelers to find companions with shared interests during their journey.

**Service Link:** https://www.togetrips.com/

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
| <img width="400" alt="Main Home" src="https://github.com/user-attachments/assets/0ccf6ebd-14c2-48e0-86c7-11203120cd11"> | <img width="400" alt="Travel Requests" src="https://github.com/user-attachments/assets/95e131ac-99ba-4713-a191-0fa10380db4f"> |
| **Chat** | **Profile** |
| <img width="400" alt="Chat" src="https://github.com/user-attachments/assets/9a95dae9-a4cc-434e-98ba-d93dddb78ef8"> | <img width="400" alt="Profile" src="https://github.com/user-attachments/assets/4693700a-08b6-45a2-b255-197a7d8d7a04"> |
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
