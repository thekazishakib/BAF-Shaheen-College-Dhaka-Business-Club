# AI Developer Agent Guide (`AGENTS.md`)

This guide is designed for AI coding assistants and developer agents working on the BAF Shaheen College Dhaka Business Club (BAFSDBC) website. It provides a technical map of the project, including architecture, folder structure, API endpoints, database schemas, security configurations, and key workflows.

---

## 1. Project Overview & Architecture

The BAFSDBC website is a modern, responsive single-page web application (SPA) built with React, TypeScript, and Vite. It serves as a public hub for club information (blogs, events, team members, galleries) and handles automated e-certificate issuance for club activities.

```
┌────────────────────────────────────────────────────────┐
│                   Browser (React SPA)                  │
│  - Public pages (Home, About, Events, Blogs, Gallery)  │
│  - /certificate: Cooldown check & details submission   │
│  - /admin: Protected CRUD panel (Google OAuth)         │
└───────────┬────────────────────────────────┬───────────┘
            │                                │
            │ (Firebase SDK)                 │ (Fetch API)
            ▼                                ▼
┌────────────────────────┐      ┌────────────────────────┐
│     Firebase Backend   │      │   Vercel Serverless    │
│  - Firebase Auth       │      │   - /api/certificate/..│
│  - Firestore DB        │      └────────────┬───────────┘
│  - Firebase Storage    │                   │
└────────────────────────┘                   │ (Fetch API + Secret)
                                             ▼
                                ┌────────────────────────┐
                                │ Google Apps Script Web │
                                │ - Lock, Cooldown       │
                                │ - Google Sheet & Form  │
                                │ - AutoCrat PDF & Email │
                                └────────────────────────┘
```

### Key Architectural Pillars:
1. **Frontend Hosting & Routing**: Hosted on Vercel with SPA rewrite rules configured in `vercel.json`.
2. **Serverless Functions**: Vercel API routes process client requests for certificates and act as a secure proxy to Google Apps Script.
3. **Firebase Integration**: 
   - **Firestore** handles dynamic content (events, testimonials, blog articles, executive committee listings).
   - **Authentication** uses Google OAuth to verify admins.
   - **Storage** hosts uploaded images (sponsors, events, blog thumbnails).
4. **Google Apps Script Bridge**: A Web App script (`Code.gs`) that writes form data into a Google Sheet and triggers the **AutoCrat** add-on to generate PDFs and email certificates to participants.

---

## 2. Codebase Structure

```
C:\Users\kazis\Downloads\11\test-main
├── .vercel/                 # Local Vercel configuration (Git-ignored)
├── api/                     # Vercel serverless API routes
│   └── certificate/
│       ├── status.ts        # GET: Cooldown check endpoint
│       └── submit.ts        # POST: Form validator & proxy submission
├── google-apps-script/      # Google Integration files
│   ├── Code.gs              # Google Apps Script Web App bridge
│   └── SETUP.md             # Detailed guide to configure Google Sheets/AutoCrat
├── public/                  # Static assets (favicons, sitemap, robots.txt, manifest)
├── src/                     # React application source code
│   ├── assets/              # Core logo and visual assets
│   ├── components/          # Reusable UI component blocks
│   │   ├── Loader.tsx       # Initial multi-stage site intro loader
│   │   ├── Navbar.tsx       # Floating adaptive navbar with mobile support
│   │   ├── RouteSkeleton.tsx# Page route loading fallback layout
│   │   ├── ContactModal.tsx # Contact form modal via Web3Forms
│   │   └── ...              # Home/page content blocks (Hero, About, FAQ, etc.)
│   ├── lib/                 # Core utilities
│   │   ├── firebase.ts      # Firebase SDK client initialization
│   │   ├── firebaseUtils.ts # Centralized Firestore error masking and logging
│   │   ├── sanitizeUrl.ts   # URL sanitization utilities
│   │   └── schemaUtils.ts   # Dynamic JSON-LD schema injectors for SEO
│   ├── pages/               # React Page-level entrypoints
│   │   ├── Home.tsx         # Main landing page
│   │   ├── AboutPage.tsx    # Club history and mission
│   │   ├── TeamPage.tsx     # Executive Committee grid
│   │   ├── EventsPage.tsx   # Active/Archive event boards
│   │   ├── BlogsPage.tsx    # News, announcements, and articles
│   │   ├── BlogDetailPage.tsx# Full blog post renderer
│   │   ├── AdminPage.tsx    # Content Management panel (Google Auth Gated)
│   │   ├── CertificatePage.tsx# e-Certificate request form
│   │   └── ...
│   ├── App.tsx              # React Router structure, SEO and breadcrumbs
│   ├── index.css            # Tailwind CSS configuration and global styling
│   └── main.tsx             # DOM mount wrapper
├── firestore.rules          # Firestore database security rules
├── storage.rules            # Firebase storage object security rules
├── vercel.json              # Vercel SPA routing and custom HTTP security headers
└── package.json             # Package scripts and project dependencies
```

---

## 3. Database Collection & Security Schemas

All administrative changes must respect the security boundaries defined in the root rules files:

### Firestore Rules (`firestore.rules`)
- **Admin Verification**: Uses `isAdmin()` checking if the authenticated user has a verified Google email matching the strict allowlist:
  - `businessclub.bafsd@gmail.com`
  - `alamsharifulshourav@gmail.com`
- **Rules Mapping**:
  - `/adminVerify/token`: Only readable by authenticated admins.
  - `/certificates/{certId}`: Open read. Creation and deletion restricted to admins. Update is only allowed for the `downloaded` field if the certificate email matches the user's verified token email.
  - Other collections (`events`, `blogs`, `team`, `gallery`, `sponsors`, `testimonials`, `singleton`): Open read to public; write restricted to admins.

### Firebase Storage Rules (`storage.rules`)
- Writes (uploads) are gated to the `/images/` path, restricted to authenticated admins, with a size limit of **5MB** and mime-type limit (`image/(jpeg|png|webp|gif)`).

---

## 4. Key Workflows

### Certificate Submission Pipeline
1. **Frontend Request**: The user fills out the form at `/certificate`.
2. **Spam & Bot Defense**:
   - **Honeypot**: Hidden `username` input must remain empty.
   - **Speed Check**: Form submit timestamp must be at least 3 seconds after page render (`rTime`).
3. **Vercel API Gateway**:
   - `/api/certificate/status`: Proxies to Google Apps Script via `GET` to check if a global 60-second cooldown is active.
   - `/api/certificate/submit`: Sanitizes variables, checks Bangladesh phone numbers (`01[3-9]\d{8}`), verifies the honeypot/speed markers, and forwards to Google Apps Script.
4. **Apps Script Web App**:
   - Acquires script lock to prevent race conditions.
   - Evaluates cooldown.
   - Queries the connected Google Sheet to verify that the email or phone number hasn't already submitted a request (duplicate prevention).
   - Posts to the programmatically hidden Google Form endpoint if clear.
5. **Google Sheets & AutoCrat**:
   - Once the row is inserted via the Google Form, the AutoCrat add-on generates a custom PDF using a template slides document and emails it to the participant.

### Admin Authentication Gating
1. User logs in at `/admin` using Google OAuth.
2. React app queries `getDoc(doc(db, 'adminVerify', 'token'))`.
3. If user email is NOT in the `firestore.rules` allowlist, Firestore rejects the read with a permission error.
4. The client catches the permission error and immediately calls `auth.signOut()`, rendering the login interface. Access is protected at the server database tier.

---

## 5. Developer Guide & Operations

### Local Development Environment
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure local environment variables:
   ```bash
   cp .env.example .env
   # Add your Firebase and Vercel dev variables
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Build verification:
   ```bash
   npm run lint
   npm run build
   ```

### Important Rules for Agents:
- **No Client-side Secrets**: Never prefix server-only keys with `VITE_`. Surfacing database credentials or tokens in browser variables allows anyone to retrieve them via developer tools.
- **Error Obfuscation**: Never output raw Firestore exceptions (`error.message`) in user alert dialogs. Wrap Firestore operations using the unified `handleFirestoreError` in `src/lib/firebaseUtils.ts`.
- **Backend Protection**: Do not attempt to modify Google Form configurations, AutoCrat logic, Apps Script, or serverless functions unless strictly directed by the user request.
