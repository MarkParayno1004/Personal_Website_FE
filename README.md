# Personal_Website_FE

Personal Portfolio and Admin Management Dashboard frontend built with **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Oxlint**.

## Tech Stack

- **React 19**
- **TypeScript** (Strict Mode & Type Checking)
- **Vite** (Blazing Fast HMR & Build)
- **Tailwind CSS** (Modern Styling)
- **Oxlint** (High-Performance Linter with React & TypeScript rules)
- **Axios** (API Client with JWT Interceptors)
- **React Router v7** (Client Routing & Protected Routes)

## Available Scripts

- `npm run dev`: Starts the local development server.
- `npm run build`: Runs type-checking (`tsc -b`) and generates production bundle (`vite build`).
- `npm run lint`: Runs Oxlint across the codebase.
- `npm run preview`: Previews the production build locally.

## Configuration & Deployment

Copy `.env.example` to `.env`. `VITE_API_BASE_URL` is the backend URL; on Vercel / Netlify / Cloudflare Pages set it in the project's build environment (Vite inlines it at build time). Build command `npm run build`, output directory `dist`. Configure the host to serve `index.html` for unknown paths (SPA fallback) so email links like `/verify-email` and `/reset-password` work.

The backend's `FRONTEND_URL` must point at this site, and the site's origin must be in the backend's `CORS_ORIGINS`.

## Auth & account pages

- `/admin/login` (with "Forgot password?"), `/forgot-password`, `/reset-password?token=...`, `/verify-email?token=...`
- `/account`: email verification status, change password, delete account
- The JWT comes only from the login response, is sent as a Bearer token, and is cleared (redirecting to login) when the API answers 401. Logout calls `POST /auth/logout`.
- List calls page through the API with `limit`/`offset` and read `X-Total-Count`.
- The CV is private: the portfolio shows "You can email me at ..." instead of a download; admins upload/download it from the dashboard.
