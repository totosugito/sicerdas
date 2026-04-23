# Frontend Guideline Document for Sicerdas

This document outlines the frontend architecture, design principles, and technologies powering the Sicerdas Learning Management System. It aims to give a clear, non-technical overview so anyone on the team can understand how the frontend is set up, why certain choices were made, and how to maintain and grow the UI in a scalable, consistent way.

## 1. Frontend Architecture

### 1.1 Overview
- **Framework**: React (with TypeScript) drives all user interfaces, ensuring a modular and declarative approach.  
- **UI Library**: Shadcn UI (built on Tailwind CSS + Radix UI) provides ready-made, accessible components.  
- **Routing**: TanStack Router handles client-side navigation using a file-based routing pattern, keeping URLs and views in sync.  
- **State Management**: Zustand offers a lightweight global store, while React Query (@tanstack/react-query) manages server state (data fetching, caching).  
- **Forms & Validation**: React Hook Form simplifies form handling; Zod powers schema validation.  
- **Internationalization**: react-i18next enables multi-language support.  

### 1.2 Scalability & Maintainability
- **Component-Based Structure**: Breaking the UI into small, reusable components (under `src/components/`) lets teams work in parallel and reuse logic.  
- **File-Based Routing**: Routes mirror filesystem structure (`src/routes/`), making it easy to locate and add pages without manual config.  
- **Type Safety**: TypeScript everywhere, plus Zod schemas, catch errors at compile-time and offer self-documenting code.  
- **Utility-First Styling**: Tailwind CSS classes keep styles co-located with markup, reducing context switching and preventing style drift.  
- **Modular Services**: API calls and React Query hooks live in `src/service/`, so data logic is separated from UI.  

## 2. Design Principles

### 2.1 Usability
- **Clear Layouts**: Consistent page structure with header, sidebar/nav (where applicable), and content area.  
- **Intuitive Controls**: Buttons, links, and form fields follow familiar patterns (e.g., primary actions on the right, cancel on the left).  

### 2.2 Accessibility (A11y)
- **Semantic HTML**: Proper use of `<button>`, `<label>`, `<nav>`, `<main>`, etc., for screen readers.  
- **Keyboard Navigation**: All interactive elements focusable and operable via keyboard.  
- **Color Contrast**: Meets WCAG AA standards for text and background colors.  
- **Aria Attributes**: Leveraged by Shadcn UI and Radix components; custom components include ARIA roles where needed.  

### 2.3 Responsiveness
- **Mobile-First**: Layouts built with Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`).  
- **Fluid Grids**: CSS grids and flexbox ensure components adapt to various screen sizes.  
- **Touch Targets**: Buttons and links sized for easy tapping.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Tailwind CSS**: Utility-first framework for fast, consistent styling.  
- **Shadcn UI + Radix**: Provides a design system of accessible components that you can style via Tailwind.  
- **Global Styles**: Minimal CSS in `index.css` to set up base resets and custom properties (e.g., fonts, dark mode toggles).

### 3.2 Theming
- **Light & Dark Mode**: Controlled via CSS class (`.dark`) on `<html>`, toggled by Zustand store.  
- **Tailwind Config**: Defines color scales, custom utilities, and variants for theming.  

### 3.3 Visual Style
- **Style Language**: Modern flat design with subtle shadows and rounded corners, reflecting a clean, educational interface.  
- **Glassmorphism**: Used sparingly for overlays (e.g., modals) with low-opacity backgrounds and backdrop blur.  

### 3.4 Color Palette
| Role            | Light Mode      | Dark Mode       |
|-----------------|-----------------|-----------------|
| Primary         | #4F46E5 (indigo)| #818CF8         |
| Secondary       | #10B981 (emerald)| #6EE7B7        |
| Accent          | #F59E0B (amber) | #FCD34D        |
| Background      | #FFFFFF         | #1F2937        |
| Surface         | #F3F4F6         | #374151        |
| Text Primary    | #111827         | #F9FAFB        |
| Text Secondary  | #6B7280         | #D1D5DB        |

### 3.5 Typography
- **Font Family**: ‘Inter’, system-fallback (sans-serif) for readability.  
- **Scale**: Modular scale from 14px (body) to 32px (headings).  

## 4. Component Structure

### 4.1 Organization
- `src/components/` for global, reusable UI pieces (buttons, cards, forms).  
- `src/hooks/` for shared logic (e.g., useDebounce, useMediaQuery).  
- `src/service/` for data-fetching hooks (useBooks, useLogin).  
- `src/pages/` or `src/routes/` for page-level components mapped to URLs.

### 4.2 Reusability
- **Atomic Components**: Buttons, Inputs, Icons—small and highly composable.  
- **Molecules & Organisms**: Cards, Tables, Gallery grids—built by combining atoms.  
- **Page Templates**: Wrap organisms into consistent layouts (e.g., DashboardTemplate).  

**Benefits**: Easier to maintain, test, and update parts without affecting the whole app. Onboarding new developers is faster when patterns are clear.

## 5. State Management

### 5.1 Local vs. Global State
- **Local Component State**: Controlled with `useState` or React Hook Form for UI interactions.  
- **Global UI State**: Stored in Zustand (e.g., theme, sidebar open/close, notifications).  
- **Server/Data State**: Managed by React Query—handles fetching, caching, background updates, and error states automatically.

### 5.2 Sharing State
- Components subscribe to Zustand stores via hooks (`useAuthStore`, `useAppStore`).  
- React Query’s cache allows separate components to share fetched data without duplicate requests.

## 6. Routing and Navigation

### 6.1 Routing Library
- **TanStack Router**: A file-based, type-safe router where each file under `src/routes/` becomes a route.  
- **Nested Routes**: Supports layouts and sub-routes (e.g., `/books`, `/books/:id`).  

### 6.2 Navigation Patterns
- **Link Components**: `<RouterLink>` handles client-side navigation with prefetching capabilities.  
- **Protected Routes**: Wrapped in auth checks—redirect unauthenticated users to `/login`.  
- **Dynamic Parameters**: Extracted with hooks (`useSearchParams`, `useParams`) for filtering, pagination, and detail views.

## 7. Performance Optimization

### 7.1 Code Splitting & Lazy Loading
- **Route-Based Splitting**: Each route bundle is loaded on demand by Vite, reducing initial payload.  
- **Dynamic Imports**: Components like heavy charts or the AI chat widget are lazy-loaded when needed.

### 7.2 Asset Optimization
- **Tailwind JIT**: Generates only the CSS classes you use, keeping final CSS minimal.  
- **Image Optimization**: Serve optimized images using `<picture>` tags or `srcset`, and leverage `sharp` on the backend.  

### 7.3 Data Efficiency
- **React Query**: Batching requests, caching, and background refetches reduce network overhead.  
- **Debounced Inputs**: Search and filter inputs debounce user typing to avoid excessive API calls.

## 8. Testing and Quality Assurance

### 8.1 Testing Strategy
- **Unit Tests**: Vitest or Jest + React Testing Library for component logic and rendering.  
- **Integration Tests**: Test interactions between components, store updates, and form flows.  
- **End-to-End (E2E) Tests**: Cypress or Playwright to simulate user journeys (login, browse books, chat).  

### 8.2 Tools and Frameworks
- **Vitest**: Fast unit test runner with built-in mocking and coverage.  
- **React Testing Library**: Focus on how users interact with the UI rather than implementation details.  
- **Cypress or Playwright**: Full-browser tests on real environments; useful for regression checks.  
- **Linting & Formatting**: Biome ensures consistent code style and catches syntax issues early.  

## 9. Conclusion and Overall Frontend Summary

Sicerdas’s frontend is built on a modern React stack emphasizing type safety, modularity, and performance. Key takeaways:
- **Scalable Architecture**: Component-based, file-based routing, and separated concerns let the app grow without becoming tangled.  
- **Clean Design**: Modern flat UI with Tailwind CSS and Shadcn UI ensures consistency, accessibility, and ease of customization.  
- **Robust Data Handling**: Zustand and React Query keep UI state and data state efficient and synchronized.  
- **Quality Focus**: Testing plans, linting, and code reviews maintain reliability as features expand.  

By following these guidelines, the frontend team can deliver new features quickly, maintain a unified look and feel, and ensure a reliable experience for all Sicerdas users.