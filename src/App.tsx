/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { injectSchema, removeSchema } from './lib/schemaUtils';
import { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { ContactModalProvider } from './components/ContactModalContext';
import { ContactModal } from './components/ContactModal';
import { Loader } from './components/Loader';
import { RouteSkeleton } from './components/RouteSkeleton';

const Home = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const BlogsPage = lazy(() => import('./pages/BlogsPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));

const BASE_URL = 'https://bafsdbc.vercel.app';

// ---------------------------------------------------------------------------
// Per-page SEO metadata
// ---------------------------------------------------------------------------
const PAGE_TITLES: Record<string, string> = {
  '/':        'BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/about':   'About : BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/team':    'Executive Committee : BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/events':  'Events & Workshops : BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/gallery': 'Event Gallery : BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/blogs':   'Blog & Business Insights : BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/terms':   'Terms and Conditions : BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/privacy': 'Privacy Policy : BAFSDBC | BAF Shaheen College Dhaka Business Club',
  '/admin':   'Admin Panel | BAF Shaheen College Dhaka Business Club',
  '/certificate': 'e-Certificate Form : BAFSDBC | BAF Shaheen College Dhaka Business Club',
};

const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/':        'BAF Shaheen College Dhaka Business Club (BAFSDBC), established 2015, is Bangladesh\'s premier student business organization. We empower students through leadership, entrepreneurship, and real-world business skills.',
  '/about':   'Established in 2015, BAFSDBC bridges academic excellence and corporate readiness. Learn about our mission to develop future business leaders through workshops, competitions, and real-world experience at BAF Shaheen College Dhaka.',
  '/team':    'Meet the passionate student leaders and faculty advisors of BAF Shaheen College Dhaka Business Club (BAFSDBC). Our executive committee drives innovation, events, and student development across Bangladesh.',
  '/events':  'Explore workshops, seminars, business competitions, and leadership events organized by BAFSDBC at BAF Shaheen College Dhaka. Register for upcoming events and grow your business skills.',
  '/gallery': 'Browse photos from BAFSDBC events, workshops, leadership programs, and club activities at BAF Shaheen College Dhaka. A visual journey of student achievement and collaboration.',
  '/blogs':   'Read articles, insights, and student perspectives on business, leadership, and entrepreneurship from BAFSDBC members at BAF Shaheen College Dhaka. Explore our knowledge hub.',
  '/terms':   'Read the Terms and Conditions for the BAF Shaheen College Dhaka Business Club (BAFSDBC) website. Understand your rights and responsibilities when using our platform.',
  '/privacy': 'Read the Privacy Policy of BAF Shaheen College Dhaka Business Club (BAFSDBC). Learn how we collect, use, and protect your information.',
  '/certificate': 'Submit your details to generate your BAFSD Business Club participation certificate.',
};

// Admin and private routes must NOT be indexed
const NOINDEX_ROUTES = new Set(['/admin', '/certificate']);

// Per-page BreadcrumbList schema
const PAGE_BREADCRUMBS: Record<string, object> = {
  '/about': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "About BAFSDBC", "item": `${BASE_URL}/about` }
    ]
  },
  '/team': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Executive Committee", "item": `${BASE_URL}/team` }
    ]
  },
  '/events': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Events & Workshops", "item": `${BASE_URL}/events` }
    ]
  },
  '/gallery': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Gallery", "item": `${BASE_URL}/gallery` }
    ]
  },
  '/blogs': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Business Insights Blog", "item": `${BASE_URL}/blogs` }
    ]
  },
  '/terms': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Terms and Conditions", "item": `${BASE_URL}/terms` }
    ]
  },
  '/privacy': {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${BASE_URL}/` },
      { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${BASE_URL}/privacy` }
    ]
  },
};

// Per-page WebPage schema (non-blog pages)
const PAGE_WEBPAGE_SCHEMAS: Record<string, object> = {
  '/about': {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${BASE_URL}/about#webpage`,
    "url": `${BASE_URL}/about`,
    "name": "About BAFSDBC | BAF Shaheen College Dhaka Business Club — Est. 2015",
    "description": "Established in 2015, BAFSDBC bridges academic excellence and corporate readiness. Learn about our mission to develop future business leaders.",
    "inLanguage": "en-US",
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "about": { "@id": `${BASE_URL}/#organization` }
  },
  '/team': {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${BASE_URL}/team#webpage`,
    "url": `${BASE_URL}/team`,
    "name": "Executive Committee BAFSDBC | BAF Shaheen College Dhaka Business Club",
    "description": "Meet the student leaders and faculty advisors of BAF Shaheen College Dhaka Business Club (BAFSDBC).",
    "inLanguage": "en-US",
    "isPartOf": { "@id": `${BASE_URL}/#website` }
  },
  '/events': {
    "@context": "https://schema.org",
    "@type": "EventSeries",
    "@id": `${BASE_URL}/events#webpage`,
    "url": `${BASE_URL}/events`,
    "name": "Events & Workshops — BAFSDBC",
    "description": "Workshops, seminars, business competitions, and leadership events organized by BAF Shaheen College Dhaka Business Club.",
    "organizer": { "@id": `${BASE_URL}/#organization` },
    "location": {
      "@type": "Place",
      "name": "BAF Shaheen College Dhaka",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dhaka",
        "addressCountry": "BD"
      }
    }
  },
  '/gallery': {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${BASE_URL}/gallery#webpage`,
    "url": `${BASE_URL}/gallery`,
    "name": "Event Gallery — BAFSDBC",
    "description": "Photo gallery of BAFSDBC events, workshops, and student achievements at BAF Shaheen College Dhaka.",
    "inLanguage": "en-US",
    "isPartOf": { "@id": `${BASE_URL}/#website` }
  },
  '/blogs': {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}/blogs#webpage`,
    "url": `${BASE_URL}/blogs`,
    "name": "Blog & Business Insights BAFSDBC | BAF Shaheen College Dhaka Business Club",
    "description": "Articles, insights, and student perspectives on business, leadership, and entrepreneurship from BAFSDBC members.",
    "inLanguage": "en-US",
    "isPartOf": { "@id": `${BASE_URL}/#website` },
    "publisher": { "@id": `${BASE_URL}/#organization` }
  },
};



// ---------------------------------------------------------------------------
// Robots meta helper — ensure noindex pages are protected
// ---------------------------------------------------------------------------
function setRobotsMetaContent(content: string) {
  let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'robots';
    document.head.appendChild(meta);
  }
  meta.content = content;
}

// ---------------------------------------------------------------------------
// Route-aware SEO updater
// ---------------------------------------------------------------------------
function ScrollAndTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // ── Robots meta ──────────────────────────────────────────────────────────
    if (NOINDEX_ROUTES.has(pathname)) {
      setRobotsMetaContent('noindex, nofollow');
    } else {
      setRobotsMetaContent('index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // ── Page Title ───────────────────────────────────────────────────────────
    const title = PAGE_TITLES[pathname] ?? 'BAFSDBC | BAF Shaheen College Dhaka Business Club';
    document.title = title;

    // ── Meta description ─────────────────────────────────────────────────────
    const desc = PAGE_DESCRIPTIONS[pathname] ?? PAGE_DESCRIPTIONS['/'];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    // ── Open Graph ───────────────────────────────────────────────────────────
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc  = document.querySelector('meta[property="og:description"]');
    const ogUrl   = document.querySelector('meta[property="og:url"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    if (ogDesc)  ogDesc.setAttribute('content', desc);
    if (ogUrl)   ogUrl.setAttribute('content', `${BASE_URL}${pathname}`);

    // ── Twitter Card ─────────────────────────────────────────────────────────
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    const twDesc  = document.querySelector('meta[name="twitter:description"]');
    if (twTitle) twTitle.setAttribute('content', title);
    if (twDesc)  twDesc.setAttribute('content', desc);

    // ── Canonical ────────────────────────────────────────────────────────────
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `${BASE_URL}${pathname}`);

    // ── Breadcrumb schema ────────────────────────────────────────────────────
    if (PAGE_BREADCRUMBS[pathname]) {
      injectSchema('breadcrumb-ld', PAGE_BREADCRUMBS[pathname]);
    } else {
      removeSchema('breadcrumb-ld');
    }

    // ── Per-page WebPage schema ──────────────────────────────────────────────
    if (PAGE_WEBPAGE_SCHEMAS[pathname]) {
      injectSchema('webpage-ld', PAGE_WEBPAGE_SCHEMAS[pathname]);
    } else {
      removeSchema('webpage-ld');
    }

  }, [pathname]);

  return null;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  return (
    <ContactModalProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 flex flex-col relative">
          <Loader />
          <ScrollAndTitle />
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<RouteSkeleton />}>
              <Routes>
                <Route path="/"           element={<Home />} />
                <Route path="/about"      element={<AboutPage />} />
                <Route path="/team"       element={<TeamPage />} />
                <Route path="/gallery"    element={<GalleryPage />} />
                <Route path="/blogs"      element={<BlogsPage />} />
                <Route path="/blogs/:slug" element={<BlogDetailPage />} />
                <Route path="/events"     element={<EventsPage />} />
                <Route path="/admin"      element={<AdminPage />} />
                <Route path="/terms"      element={<TermsPage />} />
                <Route path="/privacy"    element={<PrivacyPage />} />
                <Route path="/certificate" element={<CertificatePage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <ContactModal />
        </div>
      </Router>
    </ContactModalProvider>
  );
}
