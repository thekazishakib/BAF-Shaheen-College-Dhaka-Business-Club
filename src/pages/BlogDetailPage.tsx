import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Share2, Check, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { sanitizeUrl } from '../lib/sanitizeUrl';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Render blog content as markdown.
// Supported syntax written in the admin editor:
//   ## Heading        -> large bold section break
//   ### Subtitle      -> smaller bold sub-point, cyan-tinted
//   **bold text**     -> bold
//   > quoted line     -> indented cyan-border pull-quote
//   [text](url)       -> hyperlink
function renderBlogContent(content: string) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h2 className="text-2xl font-bold text-white mt-8 mb-3">{children}</h2>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-bold text-white mt-8 mb-3">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-baf-cyan mt-6 mb-2">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-gray-300 leading-relaxed mb-5">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-baf-cyan/50 pl-4 italic text-slate-400 my-5">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-baf-cyan underline underline-offset-2 hover:text-white transition-colors font-medium"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, 'blogs'), orderBy('createdAt', 'desc'))).then(snap => {
      const all = snap.docs.map(d => d.data());
      const found = all.find(b => slugify(b.title) === slug);
      setBlog(found || null);
      setLoading(false);

      // SEO: update meta tags for this specific blog
      if (found) {
        const pageTitle = `${found.title} : BAFSDBC | BAF Shaheen College Dhaka Business Club`;
        // Build a clean excerpt: strip extra whitespace, cut at word boundary ≤155 chars
        const rawText = (found.content || '').replace(/\s+/g, ' ').trim();
        const maxLen = 155;
        const excerpt = rawText.length <= maxLen
          ? rawText
          : rawText.substring(0, rawText.lastIndexOf(' ', maxLen)) + '…';
        document.title = pageTitle;

        const updateMeta = (selector: string, attr: string, value: string) => {
          const el = document.querySelector(selector);
          if (el) el.setAttribute(attr, value);
        };

        updateMeta('meta[name="description"]', 'content', excerpt);
        updateMeta('meta[property="og:title"]', 'content', pageTitle);
        updateMeta('meta[property="og:description"]', 'content', excerpt);
        updateMeta('meta[property="og:url"]', 'content', `https://bafsdbc.vercel.app/blogs/${slug}`);
        updateMeta('meta[property="og:image"]', 'content', found.image || 'https://bafsdbc.vercel.app/og-image.png');
        updateMeta('meta[name="twitter:title"]', 'content', pageTitle);
        updateMeta('meta[name="twitter:description"]', 'content', excerpt);
        updateMeta('meta[name="twitter:image"]', 'content', found.image || 'https://bafsdbc.vercel.app/og-image.png');
        updateMeta('link[rel="canonical"]', 'href', `https://bafsdbc.vercel.app/blogs/${slug}`);

        // JSON-LD for blog post
        const existingLd = document.getElementById('blog-ld');
        if (existingLd) existingLd.remove();
        const script = document.createElement('script');
        script.id = 'blog-ld';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": found.title,
          "description": excerpt,
          "image": found.image || 'https://bafsdbc.vercel.app/og-image.jpg',
          "datePublished": new Date(found.createdAt).toISOString(),
          "dateModified": new Date(found.createdAt).toISOString(),
          "inLanguage": "en-US",
          "articleSection": "Business & Leadership",
          "keywords": "BAFSDBC, BAF Shaheen College Dhaka Business Club, business, leadership, entrepreneurship, Bangladesh",
          "author": {
            "@type": "Person",
            "name": found.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "BAF Shaheen College Dhaka Business Club",
            "alternateName": "BAFSDBC",
            "logo": {
              "@type": "ImageObject",
              "url": "https://bafsdbc.vercel.app/favicon-512.png"
            }
          },
          "copyrightHolder": {
            "@type": "Organization",
            "name": "BAF Shaheen College Dhaka Business Club"
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://bafsdbc.vercel.app/blogs/${slug}`
          },
          "isPartOf": {
            "@type": "Blog",
            "name": "BAFSDBC Blog — Business Insights",
            "url": "https://bafsdbc.vercel.app/blogs"
          }
        });
        document.head.appendChild(script);

        // Breadcrumb schema for blog detail page
        const existingBc = document.getElementById('breadcrumb-ld');
        if (existingBc) existingBc.remove();
        const bcScript = document.createElement('script');
        bcScript.id = 'breadcrumb-ld';
        bcScript.type = 'application/ld+json';
        bcScript.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bafsdbc.vercel.app/" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://bafsdbc.vercel.app/blogs" },
            { "@type": "ListItem", "position": 3, "name": found.title, "item": `https://bafsdbc.vercel.app/blogs/${slug}` }
          ]
        });
        document.head.appendChild(bcScript);

        // Ensure robots is indexable for blog posts
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
      }
    });

    // Cleanup: remove injected schemas on unmount
    return () => {
      const el = document.getElementById('blog-ld');
      if (el) el.remove();
      const bc = document.getElementById('breadcrumb-ld');
      if (bc) bc.remove();
    };
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: blog?.title, text: blog?.content?.substring(0, 120), url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-24">
        <div className="w-10 h-10 border-4 border-baf-cyan/20 border-t-baf-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center pt-24 gap-6">
        <h1 className="text-3xl font-bold">Blog Not Found</h1>
        <Link to="/blogs" className="text-baf-cyan hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>
      </div>
    );
  }

  const date = blog.date
    ? new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-32">
      {/* Hero Image */}
      {blog.image && (
        <div className="relative h-72 md:h-96 w-full overflow-hidden">
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back + Share */}
        <div className="flex items-center justify-between py-8">
          <Link to="/blogs" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Blogs
          </Link>
          <button onClick={handleShare} className="flex items-center gap-2 text-sm text-slate-400 hover:text-baf-cyan transition-colors">
            {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            {isCopied ? 'Link Copied!' : 'Share'}
          </button>
        </div>

        {/* Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 text-xs text-baf-cyan font-bold uppercase tracking-widest mb-5 opacity-70">
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{date}</span>
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{blog.author}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight text-white mb-10 italic">
            {blog.title}
          </h1>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
            {renderBlogContent(blog.content || '')}
          </div>
        </motion.div>

        {/* Author Tag */}
        <div className="mt-16 pt-8 border-t border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-baf-cyan/20 border border-baf-cyan/30 flex items-center justify-center text-baf-cyan font-bold text-lg shrink-0">
            {blog.author?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-1">Written by</p>
            <div className="flex items-center gap-3 flex-wrap">
              {blog.authorLinkedIn ? (
                <a
                  href={sanitizeUrl(blog.authorLinkedIn)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-baf-cyan transition-colors flex items-center gap-1 group"
                >
                  {blog.author}
                  <span className="text-baf-cyan opacity-60 group-hover:opacity-100 text-xs">↗</span>
                </a>
              ) : (
                <p className="font-bold text-white">{blog.author}</p>
              )}
              {blog.authorPortfolio && (
                <>
                  <span className="text-white/20 text-sm">|</span>
                  <a
                    href={sanitizeUrl(blog.authorPortfolio)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-400 hover:text-baf-cyan transition-colors flex items-center gap-1 group"
                  >
                    Portfolio
                    <span className="text-baf-cyan opacity-60 group-hover:opacity-100 text-xs">↗</span>
                  </a>
                </>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">BAF Shaheen College Dhaka Business Club</p>
          </div>
        </div>
      </div>
    </div>
  );
}
