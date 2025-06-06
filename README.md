# TravelTogether

A social networking platform for travelers to find companions with shared interests during their journey.

Service Link : https://togetrip.vercel.app

## Tech Stack

- **Framework:** React
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State Management:** Zustand
- **API Integration:** TanStack Query
- **Maps Integration:** Google Maps API
- **Backend Services:** Firebase (Auth, Firestore, Storage)
- **Build Tool:** Vite
- **Package Manager:** npm

## Key Features

- 🗺️ Map-based traveler discovery in the same city
- 💬 Travel companion requests and chat functionality
- 📱 Responsive design with mobile browser support

## Screenshots

| Main Home | Travel Requests |
| :---: | :---: |
| <img width="400" alt="Main Home" src="https://github.com/user-attachments/assets/51d231f5-9d0f-4b14-bec3-397bd330e0df"> | <img width="400" alt="Travel Requests" src="https://github.com/user-attachments/assets/805ca1b8-abee-4913-8a1d-7c7d60e152e7"> |
| **Chat** | **Profile** |
| <img width="400" alt="Chat" src="https://github.com/user-attachments/assets/dec0cacb-ea42-4439-96ca-cfea440125f4"> | <img width="400" alt="Profile" src="https://github.com/user-attachments/assets/5fadadf8-733f-4065-a198-5b0fa8db1a13"> |



## Project Structure

```
frontend/
├── src/
│   ├── components/             # Common Components
│   ├── features/               # Feature Modules
│   │   ├── Auth/
│   │   ├── Chat/
│   │   ├── home/
│   │   ├── profile/
│   │   ├── request/
│   │   └── shared/            # Shared Features
│   ├── pages/                 # Page Components
│   │   ├── Auth/
│   │   └── Main/
│   ├── store/                # State Management
│   └── config/               # Configuration Files
├── public/
└── package.json
```
