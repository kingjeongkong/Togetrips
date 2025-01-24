# TravelTogether

A social networking platform for travelers to find companions with shared interests during their journey.

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


## Project Structure

```
frontend/
├── src/
│   ├── components/             # Common Components
│   ├── features/               # Main Features
│   │   ├── Auth/               # Authentication
│   │   │   ├── components/     
│   │   │   ├── hooks/          
│   │   │   └── services/       
│   │   └── Main/               # Main Page Features
│   │       ├── components/     
│   │       ├── section/        # Page Section Components
│   │       │   ├── Chat/       
│   │       │   ├── MainHome/   
│   │       │   ├── Profile/    
│   │       │   └── Request/   
│   │       ├── hooks/          
│   │       └── services/      
│   ├── pages/                  # Pages
│   │   ├── Auth/               # Authentication Pages
│   │   │   ├── SignIn.tsx      
│   │   │   └── SignUp.tsx      
│   │   └── Main/               # Main Pages
│   │       ├── Home.tsx        
│   │       ├── ChatLayout.tsx  
│   │       ├── Profile.tsx     
│   │       └── Requests.tsx    
│   └── store/                  # State Management
├── public/
└── package.json 
