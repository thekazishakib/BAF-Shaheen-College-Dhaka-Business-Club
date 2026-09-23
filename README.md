<p align="center">
  <img src="public/BAFSDBC_Logo_BG_removed.png" alt="BAFSDBC Logo" width="120" />
</p>

<h1 align="center">BAF Shaheen College Dhaka Business Club Website</h1>

<p align="center"><strong>Bridging Academic Excellence and Corporate Success.</strong></p>

<p align="center">
  🌐 <a href="https://bafsdbc.vercel.app">bafsdbc.vercel.app</a>
</p>

---

## Project Overview

This is the official website for the **BAF Shaheen College Dhaka Business Club (BAFSDBC)**, established in 2015. The website acts as a public information portal for students, sponsors, and partners, while also containing administrative tools for dynamic content management and a automated e-certificate delivery system.

The application is structured as a single-page application (SPA) with a responsive user interface, featuring dynamic Firebase-backed sections (events, blogs, team listings, gallery, and testimonials), a secure admin content management dashboard, and a serverless certificate proxy backend.

---

## Main Features

- **Responsive Homepage**: Modern landing page with interactive elements, featuring the club's intro, leadership committee, sponsors carousel, student testimonials, and dynamic FAQ lists.
- **About Page**: Describes the history, vision, and core mission of the club, integrated with a dynamic "Startup Roadmap" component.
- **Events Listing**: Renders active, upcoming, and archived club events, workshops, and business seminars dynamically from Firestore.
- **Team / Executive Committee Page**: Grid layout showcasing the club's executive committee, directors, and members.
- **Gallery Page**: Displays snapshots and key moments from previous events and club programs.
- **Blogs Listing & Detail Pages**: Knowledge hub showcasing student business articles and club announcements, with a dedicated content reader page at `/blogs/:slug`.
- **Privacy & Terms Pages**: Complete disclosures to support standard privacy policy compliance.
- **Admin Page**: Gated content management dashboard allowing authenticated administrators to create, update, and delete dynamic entries across website sections.
- **Firebase-Backed Dynamic Content**: All core website text blocks, carousels, lists, and pages sync instantly with Cloud Firestore.
- **Firebase Storage Image Handling**: Handles administrative image uploads (event cards, blog covers, sponsor logos) with size limits (5 MB cap), client/server MIME-type validation, and client-side canvas-based EXIF data stripping.
- **Responsive Navbar & Mobile Menu**: Floating, responsive navbar that automatically collapses on mobile viewports with an adaptive hamburger menu.
- **Navbar Scroll Animation**: Smooth visual transition where the navbar changes its padding, background opacity, and border-radius dynamically as the user scrolls.
- **Initial Polished Site Loader**: High-end multi-stage entry animation displaying loading words ("SYSTEM INITIATED", "SYNERGIZING DATA", etc.) followed by a gradient text-fill transition before sliding out of view.
- **Internal Route-Level Skeleton Loading**: React lazy-loaded pages fallback to a centralized `RouteSkeleton` layout container during navigation, keeping the Navbar mounted and independent.
- **Local Content Skeletons**: Individual data-driven components (like event grids and blog cards) display local placeholder skeletons while fetching database resources.
- **Reduced-Motion Support**: Respects system accessibility preferences by disabling or simplifying Framer Motion and Tailwind animations.
- **Certificate Submission Form**: Dedicated frontend form for participants to submit their credentials to receive official participation e-certificates.
- **Server-Side Certificate Validation**: Sanitizes and validates inputs (such as validating name lengths and ensuring correct Bangladesh mobile number formats) on the server.
- **Duplicate Protection**: Prevents multiple certificate issuances by checking manual `Email` and `Phone number` records in the sheet prior to processing.
- **Global 60-Second Cooldown**: Locks submissions globally for 60 seconds after a successful request to prevent server overloads and race conditions, enforced both client-side and server-side.
- **Automated Certificate Delivery**: Integrates serverless APIs and Google Apps Script to write details to a Google Sheet, triggering AutoCrat to generate PDF certificates and email them directly to participants.

---

## Technology Stack

- **Frontend Core**: [React](https://react.dev) (v19) & [TypeScript](https://www.typescriptlang.org)
- **Build Tool**: [Vite](https://vite.dev) (v6)
- **Styling**: Vanilla CSS, [Tailwind CSS v4](https://tailwindcss.com) (utility engine via `@tailwindcss/vite`)
- **Animations**: [Framer Motion](https://motion.dev) (v12)
- **Database & Asset Storage**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Storage](https://firebase.google.com/docs/storage)
- **Admin Identity Provider**: [Firebase Authentication](https://firebase.google.com/docs/auth) via Google OAuth
- **Hosting & Serverless Edge**: [Vercel](https://vercel.com) & Vercel Serverless Functions (`api/` endpoints)
- **Automation Bridge**: [Google Apps Script](https://developers.google.com/apps-script)
- **Data Capture & PDF Generation**: [Google Forms](https://www.google.com/forms/about), [Google Sheets](https://www.google.com/sheets/about), and [AutoCrat](https://workspace.google.com/marketplace/app/autocrat/539341275670)
- **Email Contact Form**: [Web3Forms API](https://web3forms.com)

---

## Website Routes

Based on the React Router configuration, the following routes are defined:

| URL Path | Page / Purpose | Data-Driven / Dynamic |
| :--- | :--- | :--- |
| `/` | **Home**: Landing page with hero details, incharges, reviews, and FAQs | Yes (Firestore) |
| `/about` | **About Us**: Club history, mission values, and the Startup Roadmap | Yes (Firestore) |
| `/events` | **Events**: Active and archived workshops, seminars, and registries | Yes (Firestore) |
| `/team` | **Executive Committee**: Grid of the club's board, directors, and members | Yes (Firestore) |
| `/gallery` | **Gallery**: Snapshot collections of previous club activities | Yes (Firestore) |
| `/blogs` | **Blogs**: Overview of business articles and announcements | Yes (Firestore) |
| `/blogs/:slug` | **Blog Detail**: Full blog post renderer queried by slug | Yes (Firestore) |
| `/certificate` | **e-Certificate Request**: Form submission for official certificates | Yes (Vercel API) |
| `/privacy` | **Privacy Policy**: GDPR & standard privacy disclosures | Static |
| `/terms` | **Terms & Conditions**: Website terms of service | Static |
| `/admin` | **Admin Dashboard**: Gated CMS panel to manage Firestore collections | Yes (Firestore Auth) |

---

## Loading Behavior

The application utilizes a multi-layered loading experience:
1. **Initial Site Loader**: Triggered only upon initially loading the website. Runs a multi-stage word transition followed by a gradient text-fill transition before sliding out of view.
2. **Route-Level Code Splitting**: All page components use lazy imports. During routing transitions, the screen falls back to a global `RouteSkeleton` block containing mock visual outlines.
3. **Mounted Navbar**: The floating navigation bar remains mounted, active, and fully interactive while route skeletons swap underneath.
4. **Independent Scroll Animations**: Scroll-based navbar modifications run independently of route transitions or skeleton loading states.
5. **Local Content Skeletons**: Inside dynamic pages (such as `/events` or `/blogs`), local skeleton cards are rendered while querying the Firestore collections.
6. **Certificate Page Availability Check**: Uses an inline status loader (`isCheckingStatus` animation block) while checking the global 60-second cooldown status from the server, preventing fields from rendering until availability is confirmed.
7. **Reduced Motion**: Respects accessibility preferences. If system-level reduced motion is active, Framer Motion transitions fall back to instant changes or simple opacity fades.

---

## Firebase Usage

Firebase functions entirely as a secure server-side data hub for the application:
- **Firestore Database**: Backs all dynamic sections of the website. It contains collections for:
  - `events`: Active and archived events
  - `blogs`: Written insights and articles
  - `team`: Executive committee listings
  - `gallery`: Visual assets shown in the gallery grid
  - `testimonials`: Student and alumni reviews
  - `sponsors`: Active corporate partners
  - `faqs`: Common question listings
  - `singleton`: Structured CTA and home text configs
  - `adminVerify`: Document ID `token` used to verify administrative privileges
- **Firebase Storage**: Stores uploaded event banners, sponsor logos, and blog covers under `/images/` path.
- **Firebase Authentication**: Uses Google OAuth to authenticate users, returning signed ID tokens which are verified against Firestore and Storage security rules.

---

## Certificate Pipeline

The certificate submission pipeline processes certificate details securely via a serverless proxy gateway:

```
[Website Certificate Form]
         │
         ▼
[Vercel Serverless API Gateway] (POST: /api/certificate/submit)
         │
         ▼  (Google Fetch Request + Shared Secret)
[Google Apps Script Web App] (Code.gs)
         │
         ├─── [Acquires Script Lock] (Prevents simultaneous write races)
         ├─── [Cooldown & Duplicate Verification] (Reads spreadsheet)
         │
         ▼  (Programmatic Form Post)
[Google Form Endpoint] (GOOGLE_FORM_ACTION_URL)
         │
         ▼
[Google Sheet Row Insertion]
         │
         ▼  (AutoCrat Trigger)
[AutoCrat PDF Generation & Email Dispatch]
```

### Key Security & Integration Rules:
- **Proxy Layer**: Frontend code never submits requests directly to the Google Apps Script Web App. It communicates with Vercel API endpoints (`/api/certificate/status` and `/api/certificate/submit`), which proxy the request using secure Vercel environment variables.
- **Duplicate Prevention**: Duplicate checks query the connected sheet using the manually entered `Email` and `Phone number` columns. The auto-generated `Email address` and `Score` columns (created by default form layouts) are ignored.
- **Global Cooldown**: Successful submissions trigger a 60-second cooldown block, locking the endpoint globally via script properties in Google Apps Script and verifying availability during status queries.
- **Script Lock**: The Apps Script backend executes `LockService.getScriptLock()` to lock database operations during execution, preventing race conditions or double-submissions.
- **Batch Range Check**: Only allows submissions for batches matching `HSC-2014` through `HSC-2050`.
- **Form Configuration**: Google Form settings must have the manual `Email` field required, account-based email collection disabled (to prevent authentication gates), and "Limit to 1 response" disabled.
- **AutoCrat Integration**: Row insertion triggers the AutoCrat add-on to map columns to a Google Slides template, generate the certificate PDF, and email it to the user.

---

## Environment Variables

The project requires the following environment variables. Place them in your `.env` file for local development or within the Vercel/Firebase dashboard settings:

```env
# ─── Firebase Client Config (VITE_ prefix = intentionally public) ─────────────
VITE_FIREBASE_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=000000000000
VITE_FIREBASE_APP_ID=1:000000000000:web:xxxxxxxxxxxxxxxxxxxxxxxx

# ─── Web3Forms (contact form submissions) ────────────────────────────────────
VITE_WEB3FORMS_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# ─── Server-only Certificate Integration (No VITE_ prefix to keep secure) ──────
CERTIFICATE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
CERTIFICATE_SHARED_SECRET=your_strong_shared_secret_here
CERTIFICATE_ALLOWED_ORIGIN=https://bafsdbc.vercel.app
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/thekazishakib/BAF-Shaheen-College-Dhaka-Business-Club.git
cd BAF-Shaheen-College-Dhaka-Business-Club
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Fill in your values in `.env` — refer to `.env.example` for all required keys.

### 4. Run locally
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

---

## Deployment

Hosted on **Vercel**. Steps to deploy:

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repository
3. Set **Framework Preset** to `Vite`
4. Add all environment variables from `.env` in **Settings → Environment Variables**
5. Click **Deploy**

> `vercel.json` is already configured for SPA routing and security headers (HSTS, CSP, X-Frame-Options, etc.).

---

## Firebase Setup

### Firestore

1. Go to [Firebase Console](https://console.firebase.google.com) → create a project
2. Enable **Firestore Database** (Production mode)
3. Copy your config keys into `.env`
4. Deploy rules via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

### Storage

5. Enable **Firebase Storage** (requires Blaze plan)
6. Deploy rules via Firebase CLI:
```bash
firebase deploy --only storage
```

### Authentication

7. Enable **Google** as a sign-in provider under **Authentication → Sign-in method**

### adminVerify Document

8. In Firestore Console → create collection `adminVerify` → document ID `token` → field `exists: true`

> This document must exist for the admin authorization check to work.

---

## Admin Panel

The admin panel is protected by a **two-layer server-side system**:

1. **Google OAuth** — identity confirmed by Google's servers
2. **Firestore Security Rules** — `isAdmin()` runs on Firebase's servers, checks email allowlist + `email_verified == true`

**To authorize an admin account:**

1. Open `firestore.rules` and `storage.rules`
2. Add the Google account email to the `isAdmin()` function's email list in both files
3. Deploy both rule sets:
```bash
firebase deploy --only firestore:rules,storage:rules
```

**How authorization works:**

- The user signs in with Google → Firebase issues a signed ID token
- The client calls `getDoc(adminVerify/token)` — a Rules-protected document
- Firebase's servers evaluate `isAdmin()` (email in allowlist + `email_verified == true`)
- If denied → the client signs out immediately; access is refused
- The client never makes the authorization decision

> Never add `VITE_ADMIN_*` variables or compare emails client-side. Any `VITE_*` variable is compiled into the public JS bundle and visible to anyone in DevTools. Admin security is enforced entirely server-side.

---

## Security Architecture

```
Browser (React SPA)
│
│  Google OAuth popup → Firebase Auth → Signed ID Token (1h expiry)
│
│  Every Firestore/Storage request carries this token automatically
│
▼
Firebase Servers (Firestore Rules / Storage Rules)
│
│  isAdmin() checks:
│    ✅ request.auth != null
│    ✅ email_verified == true
│    ✅ email in hardcoded allowlist
│
│  All authorization decisions are made here — never in the client
│
▼
Data / Storage
```

**Security controls in place:**

| Control | Implementation |
|---|---|
| Authentication | Google OAuth — no passwords stored |
| Session expiry | Firebase ID tokens expire after 1 hour |
| Email verification | `email_verified == true` enforced in Firestore/Storage Rules |
| Admin authorization | Server-side Firestore Rules `isAdmin()` — client never decides |
| Admin login rate limiting | Max 5 attempts per 15 min (client-side localStorage) |
| IDOR prevention | Certificate `downloaded` field update gated by `resource.data.email == request.auth.token.email` |
| File upload safety | Client: MIME allowlist + 5 MB gate + canvas EXIF strip; Server: Storage Rules mirror checks |
| Input validation | Contact form: length limits, regex, subject allowlist, HTML escaping, honeypot |
| Admin form validation | Field length limits enforced before Firestore writes |
| Rate limiting | Contact form: 3 submissions / 10 min; Firebase Auth: built-in brute-force protection |
| Secrets in frontend | Only intentionally-public Firebase config; no API keys for paid services |
| HTTPS | Vercel enforces HTTPS; HSTS header (`max-age=63072000; includeSubDomains; preload`) |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Content Security Policy | `script-src` without `unsafe-inline`; `object-src 'none'` |
| Admin route protection | `X-Robots-Tag: noindex`; `Cache-Control: no-store` at server level |
| Error leakage | Raw Firestore errors go to `console.error` only — never surfaced to users |
| Dependency surface | 0 vulnerabilities (`npm audit`); only production-necessary packages |
| Git hygiene | `.gitignore` excludes all `.env` variants and Firebase service-account JSON files |

---

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── ClubIncharge.tsx
│   ├── Leadership.tsx
│   ├── Events.tsx
│   ├── Gallery.tsx
│   ├── BlogSlider.tsx
│   ├── TestimonialSlider.tsx
│   ├── StartupRoadmap.tsx
│   ├── Sponsors.tsx
│   ├── Reviews.tsx
│   ├── FAQ.tsx
│   ├── ContactModal.tsx
│   ├── Footer.tsx
│   ├── ImageUpload.tsx
│   └── Loader.tsx
├── pages/            # Page-level components
│   ├── Home.tsx
│   ├── AboutPage.tsx
│   ├── TeamPage.tsx
│   ├── EventsPage.tsx
│   ├── GalleryPage.tsx
│   ├── BlogsPage.tsx
│   ├── BlogDetailPage.tsx
│   ├── PrivacyPage.tsx
│   ├── TermsPage.tsx
│   ├── CertificatePage.tsx
│   └── AdminPage.tsx
├── lib/              # Firebase client & utilities
│   ├── firebase.ts
│   └── firebaseUtils.ts
├── assets/           # Logo & images
└── App.tsx           # Root component & routing
api/                  # Vercel serverless API routes
├── certificate/
│   ├── status.ts
│   └── submit.ts
google-apps-script/   # Google Apps Script configuration
├── Code.gs
└── SETUP.md
public/               # Static files (favicon, sitemap, robots.txt)
firestore.rules       # Firestore Security Rules
storage.rules         # Storage Security Rules
vercel.json           # Vercel routing + security headers
.env.example          # Environment variable template (safe to commit)
```

---

## Development Notes

Developed with assistance from **Claude (Anthropic)** for code generation, debugging, and code/security auditing.

All architectural decisions, content, design direction, and final implementation were led and managed by **Kazi Shakib**.

---

## Author

**Kazi Shakib**  
[Website](https://kazishakib.vercel.app) · [GitHub](https://github.com/thekazishakib) · [LinkedIn](https://linkedin.com/in/kazishakib)

---

© 2026 BAF Shaheen College Dhaka Business Club (BAFSDBC). All rights reserved.