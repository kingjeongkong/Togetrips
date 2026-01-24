# Togetrips

A social networking platform for travelers to find companions with shared interests during their journey.

**Service Link:** https://www.togetrips.com/

## 🚀 Project Overview

A social networking platform for travelers to discover nearby companions, create/join local gatherings, and communicate through real-time chat with push notifications and PWA support.

## 📋 Key Features

- 🗺️ **Location-based Discovery**: Find travelers by city or radius
- 🎉 **Gatherings**: Create and join local activities with group chat
- 💬 **Real-time Chat**: Direct (1:1) and group messaging
- 📝 **Travel Requests**: Send and manage companion requests
- 🔔 **Push Notifications**: Firebase Cloud Messaging for chats and requests
- 📱 **PWA**: Offline support and mobile installation

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Maps:** Google Maps API, Mapbox
- **Push Notifications:** Firebase Cloud Messaging
- **PWA:** next-pwa
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **Testing:** Jest, React Testing Library, Playwright

## 🏗️ Project Structure

```
nextjs/
├── src/
│   ├── app/
│   │   ├── (main)/
│   │   │   ├── home/
│   │   │   ├── gatherings/
│   │   │   ├── chat/
│   │   │   ├── request/
│   │   │   └── profile/
│   │   ├── auth/
│   │   └── api/
│   ├── features/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── gatherings/
│   │   ├── home/
│   │   ├── notifications/
│   │   ├── profile/
│   │   ├── request/
│   │   └── shared/
│   ├── components/
│   ├── error/
│   ├── lib/
│   ├── stores/
│   └── hooks/
└── e2e/
```
