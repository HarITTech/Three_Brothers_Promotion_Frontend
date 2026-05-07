# Fobet Media Frontend

A highly dynamic, performant, and beautifully designed frontend application for Fobet Media, built with React and Vite. This application integrates seamlessly with the NestJS backend to serve dynamic content across public-facing sections while maintaining an immersive, high-fidelity visual experience.

## Features

- **Blazing Fast**: Powered by Vite for near-instant cold starts and lightning-fast HMR (Hot Module Replacement).
- **Fully Dynamic Content Integration**: Connected to a NestJS API backend to dynamically render data for:
  - Hero Slider & Team Members
  - Interactive Statistic Cards
  - Client Result Grids
  - Protocol Timelines
  - Pricing Packages
  - FAQ Accordions
  - Testimonial Videos
  - Contact Information
- **Robust Fallback Systems**: Ensures zero visual breakage. If the API is offline or fields are left empty in the database, the UI gracefully falls back to predefined, high-quality static content.
- **Admin Management Panel**: Includes an integrated, protected `/tbp-admin` route for updating site data, uploading media, and managing arrays of dynamic content. Features smart payload stripping to protect existing database records from being accidentally overwritten by empty inputs.
- **Responsive & Animated UI**: Maintains 100% of the original CSS-driven animations, floating particles, scroll reveals, and glassmorphic aesthetics.

## Project Structure

```text
fobetmedia-react/
├── public/                 # Static assets that don't require bundling
├── src/
│   ├── assets/             # Images, SVGs, and other bundled assets
│   ├── components/         # Reusable React components (Public UI)
│   │   ├── admin/          # Admin-specific layout components
│   │   └── ...             # Public section components (Hero, Stats, etc.)
│   ├── pages/              # Top-level page views
│   │   ├── admin/          # Admin dashboard and section management views
│   │   └── HomePage.jsx    # Main public landing page
│   ├── routes/             # Routing configuration
│   │   ├── AppRoutes.jsx   # Public application routes
│   │   └── AdminRoutes.jsx # Protected admin application routes
│   ├── services/           # External API integration logic
│   │   └── api.js          # Unified fetch service for backend communication
│   ├── index.css           # Global CSS variables and utility classes
│   └── main.jsx            # Application entry point
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies and npm scripts
└── vite.config.js          # Vite configuration
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- The Fobet Media Backend (NestJS) running locally or hosted online.

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd fobetmedia-react
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration

By default, the application connects to the live Render backend. If you are developing locally, update the `API_BASE_URL` in `src/services/api.js`:

```javascript
// src/services/api.js
// Uncomment for local testing:
// const API_BASE_URL = 'http://localhost:3000/api/v1'; 

// Live production API:
const API_BASE_URL = 'https://three-brothers-promotion-backend.onrender.com/api/v1';
```

### Running the Development Server

Start the Vite development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Admin Dashboard

Access the secure admin panel by navigating to:
`http://localhost:5173/tbp-admin`

### Key Admin Features:
- **JWT Authentication**: Secured routing that requires a valid token.
- **Data Safety**: Built-in payload cleanup (`cleanPayload`) recursively removes Mongoose metadata (`_id`, `__v`, `createdAt`) and empty strings before submission, ensuring strict backend validation passes and existing data is never wiped out accidentally.
- **Media Uploads**: Built-in FormData handling for direct Cloudinary uploads via the backend API.

## Building for Production

To create an optimized production build:
```bash
npm run build
```
This generates a `dist` folder containing minified HTML, CSS, and JS ready to be served by any static hosting provider (e.g., Vercel, Netlify, Nginx).

## Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Vanilla CSS (Modular & Variable-driven)
- **API Communication**: Native Fetch API
