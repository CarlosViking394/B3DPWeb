# Brisbane 3D Printing Cost Estimator

A modern web app for instant 3D printing cost estimation, built for [Brisbane 3D Printing](https://brisbane3dprinting.com.au/). Upload your 3D model, select materials, and get a real-time quote with a 3D preview.

## Features
- **3D Model Upload & Preview** (STL, OBJ, etc.)
- **Material Selection** (PLA, PLA+, PET-G, ASA, ABS, TPU)
- **Batch Mode & Optional Services**
- **Instant Cost & ETA Calculation**
- **Professional UI with Brisbane 3D Printing branding**
- **Responsive & Accessible**

## Tech Stack
- **React 19 + TypeScript**
- **Vite** (dev/build tool)
- **Tailwind CSS** (with custom brand styles)
- **Three.js** for 3D rendering
- **@react-three/fiber** & **@react-three/drei** for React 3D integration
- **jszip** for file handling
- **PostCSS** & **Autoprefixer**

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Install Dependencies
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) to view the app.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Project Structure
```
├── src/
│   ├── components/         # React UI components (upload, viewer, estimator, etc.)
│   ├── utils/              # Utility functions (cost, ETA calculations)
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   ├── index.css           # Tailwind & custom styles
│   └── vite-env.d.ts       # Vite/TS types
├── public/                 # Static assets
├── index.html              # App HTML entry
├── package.json            # Project metadata & scripts
├── postcss.config.js       # PostCSS config
├── tailwind.config.js      # Tailwind config (if present)
├── tsconfig*.json          # TypeScript configs
└── .gitignore              # Git ignore rules
```

## Scripts
- `npm run dev` – Start local dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

## Customization
- **Branding:** Colors, gradients, and UI match brisbane3dprinting.com.au (see `src/index.css`)
- **3D Rendering:** Powered by Three.js and React Three Fiber
- **Material & Cost Logic:** See `src/utils/` for calculation logic

## License
This project is proprietary and developed for Brisbane 3D Printing. Contact for licensing or commercial use.
