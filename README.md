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

This is the official website for the **BAF Shaheen College Dhaka Business Club (BAFSDBC)**, established in 2015. The website acts as a public information portal for students, sponsors, and partners. It also contains an admin dashboard for managing content and an automated e-certificate delivery system.

The application is a single-page application (SPA) with a responsive interface, dynamic Firebase-backed sections (events, blogs, team listings, gallery, testimonials), a secure admin content dashboard, and a serverless certificate proxy backend.

---

## Main Features

- **Responsive Homepage**: Landing page with the club intro, leadership committee, sponsors carousel, student testimonials, and dynamic FAQ lists.
- **About Page**: History, vision, and core mission of the club, with a dynamic "Startup Roadmap" component.
- **Events Listing**: Active, upcoming, and archived events, workshops, and business seminars, loaded from Firestore.
- **Team / Executive Committee Page**: Grid layout of the executive committee, directors, and members.
- **Gallery Page**: Snapshots and key moments from previous events and club programs.
- **Blogs Listing & Detail Pages**: Knowledge hub with student business articles and club announcements, with a reader page at `/blogs/:slug`.
- **Privacy & Terms Pages**: Privacy policy and terms of use for the website.
- **Admin Page**: Gated dashboard where authenticated administrators create, update, and delete entries across website sections.
- **Firebase-Backed Dynamic Content**: Core text blocks, carousels, lists, and pages are read from Cloud Firestore.
- **Admin Image Handling**: Images chosen in the admin panel are validated (JPEG, PNG, WebP, GIF only, 5 MB input limit), redrawn through a canvas to strip EXIF metadata, resized to at most 1200 px, and saved as WebP. The result is stored as a base64 data URL inside the Firestore document (see [Image Storage](#image-storage)).
- **Responsive Navbar & Mobile Menu**: Floating navbar that collapses into a hamburger menu on mobile.
- **Navbar Scroll Animation**: Padding, background opacity, and border-radius change smoothly as the user scrolls.
- **Initial Site Loader**: Multi-stage entry animation ("SYSTEM INITIATED", "SYNERGIZING DATA", etc.) followed by a gradient text-fill transition before sliding out.
- **Route-Level Skeleton Loading**: Lazy-loaded pages fall back to a shared `RouteSkeleton` while the Navbar stays mounted.
- **Local Content Skeletons**: Data-driven components (event grids, blog cards) show placeholder skeletons while fetching.
- **Reduced-Motion Support**: Respects system accessibility settings by disabling or simplifying animations.
- **Certificate Submission Form**: Frontend form for participants to request an official participation e-certificate.
- **Server-Side Certificate Validation**: Validates name length and Bangladesh mobile number format on the server.
- **Duplicate Protection**: Checks the manual `Email` and `Phone number` columns in the sheet before processing.
- **Global 60-Second Cooldown**: After a successful request, submissions are locked globally for 60 seconds to prevent overload and race conditions, enforced on both client and server.
- **Automated Certificate Delivery**: Vercel serverless APIs and Google Apps Script write details to a Google Sheet, which triggers AutoCrat to generate a PDF certificate and email it to the participant.

---

## Technology Stack

- **Frontend Core**: [React](https://react.dev) (v19) & [TypeScript](https://www.typescriptlang.org)
- **Build Tool**: [Vite](https://vite.dev) (v6)
- **Styling**: Vanilla CSS and [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- **Animations**: [Motion](https://motion.dev) (v12, formerly Framer Motion)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Admin Identity Provider**: [Firebase Authentication](https://firebase.google.com/docs/auth) via Google OAuth
- **Hosting & Serverless**: [Vercel](https://vercel.com) and Vercel Serverless Functions (`api/` endpoints)
- **Automation Bridge**: [Google Apps Script](https://developers.google.com/apps-script)
- **Data Capture & PDF Generation**: [Google Forms](https://www.google.com/forms/about), [Google Sheets](https://www.google.com/sheets/about), and [AutoCrat](https://workspace.google.com/marketplace/app/autocrat/539341275670)
- **Email Contact Form**: [Web3Forms API](https://web3forms.com)

---

## Website Routes

| URL Path | Page / Purpose | Data-Driven / Dynamic |
| :--- | :--- | :--- |
| `/` | **Home**: Hero, incharges, reviews, and FAQs | Yes (Firestore) |
| `/about` | **About Us**: Club history, mission, and Startup Roadmap | Yes (Firestore) |
| `/events` | **Events**: Active and archived workshops, seminars, and registrations | Yes (Firestore) |
| `/team` | **Executive Committee**: Board, directors, and members | Yes (Firestore) |
| `/gallery` | **Gallery**: Photos from previous club activities | Yes (Firestore) |
| `/blogs` | **Blogs**: Business articles and announcements | Yes (Firestore) |
| `/blogs/:slug` | **Blog Detail**: Full blog post, queried by slug | Yes (Firestore) |
| `/certificate` | **e-Certificate Request**: Form for official certificates | Yes (Vercel API) |
| `/privacy` | **Privacy Policy** | Static |
| `/terms` | **Terms & Conditions** | Static |
| `/admin` | **Admin Dashboard**: Gated CMS to manage Firestore collections | Yes (Firestore + Auth) |

---

## Loading Behavior

1. **Initial Site Loader**: Runs once when the website first loads: a multi-stage word transition, then a gradient text-fill, then a slide-out.
2. **Route-Level Code Splitting**: All pages use lazy imports. During navigation the screen falls back to a global `RouteSkeleton`.
3. **Mounted Navbar**: The navbar stays mounted and interactive while route skeletons swap underneath.
4. **Independent Scroll Animations**: Scroll-based navbar changes run independently of route transitions.
5. **Local Content Skeletons**: Dynamic pages (such as `/events` and `/blogs`) render skeleton cards while querying Firestore.
6. **Certificate Availability Check**: The certificate page shows an inline loader (`isCheckingStatus`) while checking the global cooldown status, and does not render the fields until availability is confirmed.
7. **Reduced Motion**: With system-level reduced motion on, transitions fall back to instant changes or simple opacity fades.

---

## Firebase Usage

- **Firestore Database** backs all dynamic sections. Collections:
  - `events`: Active and archived events
  - `blogs`: Articles and insights
  - `team`: Executive committee listings
  - `gallery`: Images and captions for the gallery grid
  - `testimonials`: Student and alumni reviews
  - `sponsors`: Corporate partners
  - `incharges`: Club incharges
  - `heroImages`: Homepage hero slider images
  - `faqs`: Common questions
  - `singleton`: CTA and other single-document configs
  - `certificates`: Certificate records (read only by admins)
  - `adminVerify`: Document ID `token`, used to check administrative privileges
- **Firebase Authentication** uses Google OAuth. Signed ID tokens are checked against Firestore security rules.
- **Firebase Storage** is not used by the admin panel at the moment. `storage.rules` is kept so the bucket stays locked down (public read of `images/`, admin-only write) if Storage is used later.

### Image Storage

Images are **not** uploaded to Firebase Storage. `ImageUpload` compresses each image in the browser and the admin panel saves the resulting base64 data URL in a field (`image`, `logo`, or `url`) of the Firestore document.

What this means in practice:

- A Firestore document can be at most **1 MiB**, so the admin form rejects any image string longer than **900,000 characters**. Plain text fields keep their own, smaller limits (for example 2,048 characters for a link).
- Every image is downloaded together with its document. Large galleries load slower than they would with Storage URLs.
- If you outgrow this, move uploads to Firebase Storage and save only the download URL in Firestore. `storage.rules` already allows admin writes to `images/`, but `firebase.json` would also need a `storage` entry.

---

## Certificate Pipeline

Certificate details go through a serverless proxy:

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

### Key Security & Integration Rules

- **Proxy Layer**: Frontend code never calls the Google Apps Script Web App directly. It talks to `/api/certificate/status` and `/api/certificate/submit`, which forward the request using server-side Vercel environment variables.
- **Duplicate Prevention**: Checks use the manually entered `Email` and `Phone number` columns. The auto-generated `Email address` and `Score` columns from default form layouts are ignored.
- **Global Cooldown**: A successful submission starts a 60-second lock, stored in Apps Script properties and checked on status queries.
- **Script Lock**: The Apps Script backend uses `LockService.getScriptLock()` during execution to prevent race conditions and double submissions.
- **Batch Range Check**: Only batches `HSC-2014` through `HSC-2050` are accepted.
- **Form Configuration**: In the Google Form, the manual `Email` field must be required, account-based email collection must be off, and "Limit to 1 response" must be off.
- **AutoCrat Integration**: Row insertion triggers AutoCrat to fill a Google Slides template, generate the PDF, and email it to the participant.

See [`google-apps-script/SETUP.md`](google-apps-script/SETUP.md) for the full Apps Script setup.

---

## Environment Variables

Put these in a local `.env` file for development, or in the Vercel dashboard for deployment. Never commit `.env`.

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

# ─── Server-only Certificate Integration (no VITE_ prefix, keeps it private) ──
CERTIFICATE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
CERTIFICATE_SHARED_SECRET=your_strong_shared_secret_here
CERTIFICATE_ALLOWED_ORIGIN=https://bafsdbc.vercel.app
```

Any variable starting with `VITE_` is compiled into the public JavaScript bundle. The Firebase web config is designed to be public, so restrict the API key to your site's domain in Google Cloud Console (APIs & Services → Credentials → HTTP referrers). Keep real secrets, such as `CERTIFICATE_SHARED_SECRET`, without the `VITE_` prefix.

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
Fill in your values in `.env`. `.env.example` lists every required key.

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

The site is hosted on **Vercel**.

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com), choose **New Project**, and import the repository.
3. Set **Framework Preset** to `Vite`.
4. Add every variable from `.env` under **Settings → Environment Variables**.
5. Click **Deploy**.

`vercel.json` already contains SPA routing and security headers (HSTS, CSP, X-Frame-Options, and more).

---

## Firebase Setup

### Firestore

1. Open the [Firebase Console](https://console.firebase.google.com) and create a project.
2. Enable **Firestore Database** in production mode.
3. Copy your config keys into `.env`.
4. Prepare and deploy the rules as described under [Admin Panel](#admin-panel). Do not deploy `firestore.rules` before replacing the placeholder emails.

### Authentication

5. Under **Authentication → Sign-in method**, enable **Google**.
6. Under **Authentication → Settings → Authorized domains**, add your Vercel domain.

### adminVerify Document

7. In the Firestore Console, create the collection `adminVerify`, with document ID `token` and a field `exists: true`.

This document must exist, otherwise the admin authorization check fails.

### Storage (optional, not used by the admin panel today)

8. Only needed if you move image uploads to Firebase Storage. It requires the Blaze plan, and `firebase.json` needs a `storage` entry pointing at `storage.rules`.

---

## Admin Panel

Access to `/admin` is protected by two server-side layers:

1. **Google OAuth**: identity is confirmed by Google's servers.
2. **Firestore Security Rules**: `isAdmin()` runs on Firebase's servers and checks an email allowlist plus `email_verified == true`.

**How authorization works:**

- The user signs in with Google and Firebase issues a signed ID token.
- The client reads `adminVerify/token`, a document protected by the rules.
- Firebase evaluates `isAdmin()` on its servers.
- If the read is denied, the client signs the user out immediately.
- The client never makes the authorization decision itself.

**To authorize an admin account:**

The rules in this repository use **placeholder** addresses (`admin1@gmail.com`, `admin2@gmail.com`). Those may belong to real people, and deploying them would lock out your actual admins.

1. Edit `isAdmin()` in `firestore.rules` (and in `storage.rules`, if you use Storage) and put in the real admin emails.
2. Publish the rules. The safest way is to paste them into **Firebase Console → Firestore → Rules → Publish**. If you use the CLI instead, run:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. Discard the local change so real emails never reach the public repository:
   ```bash
   git checkout firestore.rules storage.rules
   ```

**Never commit real admin emails to this repository.** Also do not add `VITE_ADMIN_*` variables or compare emails on the client, because everything with a `VITE_` prefix ends up in the public JavaScript bundle.

---

## Security Architecture

```
Browser (React SPA)
│
│  Google OAuth popup → Firebase Auth → Signed ID Token (1h expiry)
│
│  Every Firestore request carries this token automatically
│
▼
Firebase Servers (Firestore Rules)
│
│  isAdmin() checks:
│    ✅ request.auth != null
│    ✅ email_verified == true
│    ✅ email is in the allowlist inside the rules
│
│  Authorization decisions are made here, never in the client
│
▼
Data
```

**Security controls in place:**

| Control | Implementation |
|---|---|
| Authentication | Google OAuth, no passwords stored |
| Session expiry | Firebase ID tokens expire after 1 hour |
| Email verification | `email_verified == true` enforced in the rules |
| Admin authorization | Server-side `isAdmin()` in Firestore Rules; the client never decides |
| Admin login throttling | Max 5 attempts per 15 min, kept in `localStorage`. This only slows popup spam and can be reset by the user; real protection is the rules |
| IDOR prevention | Updating the certificate `downloaded` field requires `resource.data.email == request.auth.token.email` |
| Image upload safety | Client-side MIME allowlist, 5 MB input limit, canvas re-encode that strips EXIF, and a 900,000-character cap before writing to Firestore |
| Input validation | Contact form: length limits, regex, subject allowlist, HTML escaping, honeypot field |
| Admin form validation | Field length limits enforced before Firestore writes |
| Contact form rate limiting | 3 submissions per 10 min, kept in `localStorage` (client-side only) |
| Secrets in frontend | Only the intentionally public Firebase config and Web3Forms key; certificate secrets stay server-side |
| HTTPS | Enforced by Vercel; HSTS header (`max-age=63072000; includeSubDomains; preload`) |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Content Security Policy | `script-src` without `unsafe-inline`; `object-src 'none'`; `base-uri 'self'` |
| Admin route protection | `X-Robots-Tag: noindex` and `Cache-Control: no-store` at server level |
| Error leakage | Raw Firestore errors go to `console.error` only and are not shown to users |
| Git hygiene | `.gitignore` excludes all `.env` variants and Firebase service-account JSON files |

Run `npm audit` before each release to check dependencies.

---

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── About.tsx
│   ├── Administration.tsx
│   ├── BlogSlider.tsx
│   ├── ClubIncharge.tsx
│   ├── ContactModal.tsx
│   ├── ContactModalContext.tsx
│   ├── Counter.tsx
│   ├── Events.tsx
│   ├── FAQ.tsx
│   ├── Footer.tsx
│   ├── Gallery.tsx
│   ├── Hero.tsx
│   ├── ImageUpload.tsx
│   ├── Leadership.tsx
│   ├── Loader.tsx
│   ├── Navbar.tsx
│   ├── RouteSkeleton.tsx
│   ├── Sponsors.tsx
│   ├── StartupRoadmap.tsx
│   └── TestimonialSlider.tsx
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
├── lib/              # Firebase client and utilities
│   ├── firebase.ts
│   ├── firebaseUtils.ts
│   ├── renderExcerpt.tsx
│   ├── sanitizeUrl.ts
│   └── schemaUtils.ts
├── assets/           # Images
└── App.tsx           # Root component and routing
api/                  # Vercel serverless API routes
├── certificate/
│   ├── status.ts
│   └── submit.ts
google-apps-script/   # Google Apps Script code and setup guide
├── Code.gs
└── SETUP.md
public/               # Static files (favicons, sitemap, robots.txt, logo)
firestore.rules       # Firestore Security Rules (placeholder admin emails)
storage.rules         # Storage Security Rules (placeholder admin emails)
vercel.json           # Vercel routing and security headers
.env.example          # Environment variable template (safe to commit)
```

---

## Development Notes

Developed with assistance from **Claude (Anthropic)** for code generation, debugging, and code and security review.

All architectural decisions, content, design direction, and final implementation were led and managed by **Kazi Shakib**.

---

## Author

**Kazi Shakib**  
[Website](https://kazishakib.vercel.app) · [GitHub](https://github.com/thekazishakib) · [LinkedIn](https://linkedin.com/in/kazishakib)

---

## License

The source code in this repository is released under the [MIT License](LICENSE).

The MIT License covers source code only. The BAFSDBC name and logo, member, sponsor, and event images, and other club content (including everything in `public/` and `src/assets/`) are **not** licensed for reuse. See [NOTICE](NOTICE) for details.

Copyright (c) 2026 Kazi Shakib.
