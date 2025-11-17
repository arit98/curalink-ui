# Cura-Link UI

## Project Structure

```
cura-link/ui/
├── dist/                          # Build output directory
│   ├── assets/
│   │   ├── hero-medical-DXyO9XAq.jpg
│   │   ├── index-4b228Wco.css
│   │   └── index-BInnJqAP.js
│   ├── favicon.ico
│   ├── index.html
│   ├── placeholder.svg
│   └── robots.txt
├── node_modules/                  # Dependencies (not tracked in git)
├── public/                        # Static public assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/                           # Source code
│   ├── assets/                    # Image assets
│   │   └── hero-medical.jpg
│   ├── components/                # React components
│   │   ├── AddClinicalTrials Modal.tsx
│   │   ├── Discussion Modal.tsx
│   │   ├── ExpertCard.tsx
│   │   ├── ExpertDetailsModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── PublicationCard.tsx
│   │   ├── PublicationDetailsModal.tsx
│   │   ├── TrialCard.tsx
│   │   ├── TrialDetailsModal.tsx
│   │   └── ui/                    # UI component library (shadcn/ui)
│   │       ├── accordion.tsx
│   │       ├── alert-dialog.tsx
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── breadcrumb.tsx
│   │       ├── button.tsx
│   │       ├── calendar.tsx
│   │       ├── card.tsx
│   │       ├── carousel.tsx
│   │       ├── chart.tsx
│   │       ├── checkbox.tsx
│   │       ├── collapsible.tsx
│   │       ├── command.tsx
│   │       ├── context-menu.tsx
│   │       ├── dialog.tsx
│   │       ├── drawer.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── hover-card.tsx
│   │       ├── input-otp.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── menubar.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── pagination.tsx
│   │       ├── popover.tsx
│   │       ├── progress.tsx
│   │       ├── radio-group.tsx
│   │       ├── resizable.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── slider.tsx
│   │       ├── switch.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── toggle-group.tsx
│   │       ├── toggle.tsx
│   │       ├── tooltip.tsx
│   │       └── use-toast.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   └── useFavorites.ts
│   ├── lib/                       # Utility libraries
│   │   ├── apiConfig.ts
│   │   ├── helper.ts
│   │   └── utils.ts
│   ├── pages/                     # Page components
│   │   ├── ClinicalTrials.tsx
│   │   ├── Experts.tsx
│   │   ├── Favorites.tsx
│   │   ├── Forums.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   ├── PatientDashboard.tsx
│   │   ├── PatientOnboarding.tsx
│   │   ├── PatientProfile.tsx
│   │   ├── Publications.tsx
│   │   ├── ResearcherDashboard.tsx
│   │   ├── ResearcherOnboarding.tsx
│   │   └── User.tsx
│   ├── services/                  # API service layer
│   │   ├── authService.ts
│   │   ├── expertService.ts
│   │   ├── favouritesService.ts
│   │   ├── patientService.ts
│   │   ├── publicationService.ts
│   │   ├── researcherService.ts
│   │   └── trialService.ts
│   ├── styles/                    # Global styles
│   ├── App.css
│   ├── App.tsx                    # Main App component
│   ├── index.css                  # Global CSS
│   ├── main.tsx                   # Application entry point
│   └── vite-env.d.ts              # Vite type definitions
├── .gitignore                     # Git ignore rules (if exists)
├── bun.lockb                      # Bun lock file
├── components.json                # shadcn/ui configuration
├── eslint.config.js               # ESLint configuration
├── index.html                     # HTML entry point
├── package-lock.json              # npm lock file
├── package.json                   # Project dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── README.md                      # Project documentation
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.app.json              # TypeScript config for app
├── tsconfig.json                  # TypeScript base configuration
├── tsconfig.node.json             # TypeScript config for Node
└── vite.config.ts                 # Vite build configuration
```

## Key Directories

- **`src/components/`** - Reusable React components including custom components and shadcn/ui UI library
- **`src/pages/`** - Page-level components for different routes
- **`src/services/`** - API service functions for backend communication
- **`src/hooks/`** - Custom React hooks for shared logic
- **`src/lib/`** - Utility functions and helper modules
- **`public/`** - Static assets served directly
- **`dist/`** - Production build output (generated)

