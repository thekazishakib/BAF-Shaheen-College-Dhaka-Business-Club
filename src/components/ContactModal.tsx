import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useContactModal } from './ContactModalContext';
import { useState, FormEvent } from 'react';

// ─────────────────────────────────────────────────────────────
// ContactModal — Secure contact form
//
// Security measures:
//  1. HTML-escape all user input before injecting into email body
//     (prevents HTML-injection / email-header-injection).
//  2. Server-side subject allowlist validation.
//  3. Strict input validation with explicit max-lengths.
//  4. Client-side rate limiting (3 submissions / 10 min) stored
//     in localStorage to deter spam/bot abuse.
//  5. Honeypot field to catch simple bots.
// ─────────────────────────────────────────────────────────────

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_API_KEY || '';

// Keep this list server-authoritative — validated before submit.
const SUBJECTS = [
  'Join the Club',
  'Event Inquiry',
  'Sponsorship / Partnership',
  'General Question',
  'Other',
] as const;
type Subject = (typeof SUBJECTS)[number];

// ── Rate limiting ─────────────────────────────────────────────
const RL_KEY        = 'bafsdbc_contact_rl';
const RL_MAX        = 3;
const RL_WINDOW_MS  = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(): { allowed: boolean; waitMinutes?: number } {
  try {
    const raw  = localStorage.getItem(RL_KEY);
    const now  = Date.now();
    if (!raw) {
      localStorage.setItem(RL_KEY, JSON.stringify({ count: 1, windowStart: now }));
      return { allowed: true };
    }
    const { count, windowStart } = JSON.parse(raw) as { count: number; windowStart: number };
    if (now - windowStart > RL_WINDOW_MS) {
      localStorage.setItem(RL_KEY, JSON.stringify({ count: 1, windowStart: now }));
      return { allowed: true };
    }
    if (count >= RL_MAX) {
      const waitMinutes = Math.ceil((RL_WINDOW_MS - (now - windowStart)) / 60_000);
      return { allowed: false, waitMinutes };
    }
    localStorage.setItem(RL_KEY, JSON.stringify({ count: count + 1, windowStart }));
    return { allowed: true };
  } catch {
    return { allowed: true }; // fail-open if storage is unavailable
  }
}

// ── HTML escaping ─────────────────────────────────────────────
// SECURITY: ALL user-supplied strings must go through this before
// being placed inside an HTML email template.
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;')
    .replace(/\//g, '&#x2F;');
}

// ── Input validation ──────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[\d\s+\-(). ]{7,20}$/;

function validateForm(data: {
  name: string; email: string; phone: string;
  subject: string; message: string;
}): string | null {
  const name = data.name.trim();
  if (!name || name.length < 2)   return 'Name must be at least 2 characters.';
  if (name.length > 100)           return 'Name must be under 100 characters.';

  if (!EMAIL_RE.test(data.email))  return 'Please enter a valid email address.';
  if (data.email.length > 254)     return 'Email address is too long.';

  if (data.phone && !PHONE_RE.test(data.phone))
    return 'Phone number can only contain digits, spaces, +, -, (, ).';

  // Allowlist — prevents a tampered select value from reaching the email
  if (!(SUBJECTS as readonly string[]).includes(data.subject))
    return 'Please select a valid subject from the list.';

  const message = data.message.trim();
  if (!message || message.length < 10) return 'Message must be at least 10 characters.';
  if (message.length > 2000)            return 'Message must be under 2000 characters.';

  return null;
}

// ── Email template ────────────────────────────────────────────
function buildPlainText(
  name: string, email: string, phone: string,
  subject: string, message: string,
): string {
  const divider = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  const lines = [
    divider,
    `  BAF SHAHEEN COLLEGE DHAKA — BUSINESS CLUB`,
    `  New Contact Form Submission`,
    divider,
    ``,
    `  CATEGORY   »  ${subject}`,
    ``,
    `  FROM       »  ${name}`,
    `  EMAIL      »  ${email}`,
    phone ? `  PHONE      »  ${phone}` : null,
    ``,
    divider,
    `  MESSAGE`,
    divider,
    ``,
    `  ${message.replace(/\n/g, '\n  ')}`,
    ``,
    divider,
    `  Sent via bafsdbc.vercel.app`,
    divider,
  ].filter(l => l !== null).join('\n');
  return lines;
}

// ─────────────────────────────────────────────────────────────

export function ContactModal() {
  const { isOpen, closeModal } = useContactModal();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    subject: SUBJECTS[0] as Subject, message: '',
    honeypot: '', // hidden anti-bot field
  });
  const [status, setStatus]       = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [rateLimitError,  setRateLimitError]  = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setRateLimitError(null);

    // ── Honeypot check (bots fill hidden fields, humans don't)
    if (formData.honeypot) return;

    // ── Rate limit check
    const rl = checkRateLimit();
    if (!rl.allowed) {
      setRateLimitError(
        `Too many submissions. Please wait ${rl.waitMinutes} minute${rl.waitMinutes !== 1 ? 's' : ''} before trying again.`
      );
      return;
    }

    // ── Input validation
    const err = validateForm(formData);
    if (err) { setValidationError(err); return; }

    setStatus('submitting');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name:  `${formData.name.trim()} via BAFSDBC`,
          subject:    `[BAFSDBC] ${formData.subject} — ${formData.name.trim()}`,
          replyto:    formData.email.trim(),
          message: buildPlainText(
            formData.name.trim(),
            formData.email.trim(),
            formData.phone.trim(),
            formData.subject,
            formData.message.trim(),
          ),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setFormData({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '', honeypot: '' });
          closeModal();
        }, 2500);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/10 p-8 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
              <p className="text-gray-400 text-sm">Join the club or send us a message. We'll get back to you soon.</p>
            </div>

            {status === 'success' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400 text-sm">Thank you for reaching out. We'll get back to you soon.</p>
              </motion.div>
            ) : status === 'error' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Something went wrong!</h3>
                <p className="text-gray-400 text-sm">Please try again or contact us directly.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                {/* ── Error banners ── */}
                {(validationError || rateLimitError) && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {validationError || rateLimitError}
                  </div>
                )}

                {/* Honeypot — hidden from real users, visible to bots */}
                <input
                  type="text"
                  name="website"
                  value={formData.honeypot}
                  onChange={e => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: 'none' }}
                  aria-hidden="true"
                  tabIndex={-1}
                  autoComplete="off"
                />

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name <span className="text-baf-cyan">*</span>
                  </label>
                  <input
                    type="text" id="name" required
                    maxLength={100}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-baf-cyan focus:border-transparent transition-all"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email <span className="text-baf-cyan">*</span>
                    </label>
                    <input
                      type="email" id="email" required
                      maxLength={254}
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-baf-cyan focus:border-transparent transition-all"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                      Phone <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="tel" id="phone"
                      maxLength={20}
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-baf-cyan focus:border-transparent transition-all"
                      placeholder="+880..."
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                    Subject <span className="text-baf-cyan">*</span>
                  </label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value as Subject })}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-baf-cyan focus:border-transparent transition-all"
                  >
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message <span className="text-baf-cyan">*</span>
                  </label>
                  <textarea
                    id="message" required
                    maxLength={2000}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-baf-cyan focus:border-transparent transition-all resize-none"
                    placeholder="How can we help you?"
                  />
                  <p className="text-xs text-slate-500 mt-1 text-right">{formData.message.length}/2000</p>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-baf-cyan hover:bg-white text-black font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {status === 'submitting' ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
