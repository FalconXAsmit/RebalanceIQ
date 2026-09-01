# RebalanceIQ Frontend Design Document

This document outlines the UI design, architecture, and styling guidelines used in building the frontend of RebalanceIQ. 

## 1. Tech Stack
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + Native CSS Custom Properties
- **Icons:** Lucide-React
- **Charts:** Recharts
- **State Management:** Custom React Context (`AppStateProvider` for routing/state, `ThemeProvider` for dark mode)

## 2. Global Styling & Theming
The application supports a robust light and dark mode, orchestrated via a global `ThemeProvider` and Tailwind CSS custom variants (`@custom-variant dark`).

### Color Palette
The color system relies on CSS variables defined in `index.css`, making it easy to toggle between themes.

**Brand Colors:**
- Primary Orange: `#f97316` (Brand accent used for calls to action, sliders, and highlights)
- Orange Light: `#fdba74`
- Orange Dark: `#ea580c`

**Semantic Colors:**
- Success: `#10b981` (Green)
- Danger: `#ef4444` (Red)

**Neutral / Navy Scale (used for backgrounds, borders, and text):**
- Navy 50 (`#f8fafc`) to Navy 950 (`#020617`)

**Theme Variables:**
- `Light Mode:` Background (`#fafafa`), Card (`#ffffff`), Text Primary (`#0f172a`)
- `Dark Mode:` Background (`#0f172a`), Card (`#1e293b`), Text Primary (`#f1f5f9`)

### Typography
- **Primary Font:** 'Inter', system-ui, -apple-system, sans-serif
- Anti-aliased font smoothing is globally applied for crisp rendering across operating systems.

## 3. UI Components & Micro-interactions
The UI is highly modular and utilizes custom styling for specific input elements to ensure cross-browser consistency.

- **Custom Range Sliders:** A bespoke range input style is defined in `index.css` with a circular brand-orange thumb, white border, and soft drop shadow.
- **Animations:** 
  - `fadeIn` (`0.2s ease-out`): Used for smooth screen transitions.
  - `scaleIn` (`0.22s cubic-bezier`): Used for card and modal pop-ins to create a snappy, modern feel.
- **Selection Color:** Text selection uses a transparent orange tint (`rgba(249, 115, 22, 0.2)`).

## 4. Architecture & Routing
Instead of traditional URL-based routing (like React Router), the application uses a lightweight Context-based state machine for navigating between screens.

**Core Screens (`/src/screens`):**
1. **Onboarding Flow:** `LandingScreen` -> `RiskAssessmentScreen` -> `RiskResultScreen`
2. **Setup Flow:** `PortfolioScreen` -> `BacktestScreen` -> `ResultsScreen`
3. **Dashboard Flow:** A suite of dashboard views (`DashboardOverview`, `DashboardRisk`, `DashboardPortfolio`, `DashboardBacktest`, `DashboardResults`) for post-setup management.

**Component Structure (`/src/components`):**
- `charts/`: Recharts-based data visualizations.
- `layout/`: Containers, sidebars, and grid structures.
- `navigation/`: Header, footer, and tab controls.
- `ui/`: Reusable primitive components (buttons, inputs, cards).

## 5. Design Philosophy
RebalanceIQ aims for a clean, data-dense, yet accessible financial interface. The use of a "Navy" color scale instead of pure black/gray provides a premium, modern SaaS aesthetic, while the vibrant orange accents guide user attention to primary actions and critical data points. Glassmorphism and soft shadows are used sparingly to establish hierarchy between the background and interactive cards.
