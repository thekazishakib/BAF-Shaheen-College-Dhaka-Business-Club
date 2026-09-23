import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Clock, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const BATCH_START_YEAR = 2014;
const BATCHES = Array.from({ length: 2050 - BATCH_START_YEAR + 1 }, (_, i) => "HSC-" + (BATCH_START_YEAR + i));

const ROLES = [
  "President", "Vice President", "General Secretary", "Dir. Of IT",
  "Dir. Graphics & Media", "Dir. Organising", "Dir. Event Management",
  "Dir. Public Relation", "Dir. Adroit", "Dir. Photography",
  "Section Rep", "General Member"
];

interface CooldownState {
  available: boolean;
  retryAfterSeconds: number;
}

export default function CertificatePage() {
  // Form values state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [batch, setBatch] = useState('');
  const [role, setRole] = useState('');
  const [disclaimer, setDisclaimer] = useState(false);
  const [signature, setSignature] = useState(false);
  
  // Honeypot state (for bot mitigation)
  const [username, setUsername] = useState('');
  
  // Render time state
  const renderTimeRef = useRef<number>(0);

  // Status and loading states
  const [cooldown, setCooldown] = useState<CooldownState>({ available: true, retryAfterSeconds: 0 });
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Custom display/validation error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  // Record the render timestamp once when component mounts
  useEffect(() => {
    renderTimeRef.current = Date.now();
    fetchCooldownStatus();
  }, []);

  // Countdown timer for cooldowns
  useEffect(() => {
    if (cooldown.retryAfterSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev.retryAfterSeconds <= 1) {
          clearInterval(interval);
          // When countdown hits zero, query the server to re-verify availability
          recheckAvailability();
          return { available: true, retryAfterSeconds: 0 };
        }
        return {
          ...prev,
          retryAfterSeconds: prev.retryAfterSeconds - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown.retryAfterSeconds]);

  // Helper to query backend for current cooldown status
  const fetchCooldownStatus = async () => {
    setIsCheckingStatus(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/certificate/status', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setCooldown({
          available: data.available,
          retryAfterSeconds: data.retryAfterSeconds ?? 0
        });
      } else {
        setSubmitError("We couldn't reach the server to check availability. Please refresh.");
      }
    } catch (e) {
      setSubmitError("We couldn't reach the server to check availability. Please check your internet connection.");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Re-verify availability from server when countdown hits zero
  const recheckAvailability = async () => {
    setIsCheckingStatus(true);
    try {
      const res = await fetch('/api/certificate/status', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const data = await res.json();
        setCooldown({
          available: data.available,
          retryAfterSeconds: data.retryAfterSeconds ?? 0
        });
      }
    } catch (e) {
      // Keep it silent during auto-checking
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Form validations
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};
    
    // Name validation
    const trimmedName = name.trim().replace(/\s+/g, ' ');
    if (!trimmedName) {
      tempErrors.name = 'Name is required.';
    } else if (trimmedName.length > 100) {
      tempErrors.name = 'Name must be less than 100 characters.';
    }

    // Email validation
    const trimmedEmail = email.trim();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!trimmedEmail) {
      tempErrors.email = 'Email is required.';
    } else if (trimmedEmail.length > 254) {
      tempErrors.email = 'Email must be less than 254 characters.';
    } else if (!emailRegex.test(trimmedEmail)) {
      tempErrors.email = 'Please enter a valid email address.';
    }

    // Phone validation
    const trimmedPhone = phone.trim();
    // Normalize to digits and strip country codes to check format
    const normalized = trimmedPhone.replace(/[\s\-\+\(\)]/g, '');
    const cleanPhone = normalized.startsWith('8801') ? normalized.substring(2) : normalized;
    const bdPhoneRegex = /^01[3-9]\d{8}$/;

    if (!trimmedPhone) {
      tempErrors.phone = 'Phone number is required.';
    } else if (trimmedPhone.length > 30) {
      tempErrors.phone = 'Phone number is too long.';
    } else if (!bdPhoneRegex.test(cleanPhone)) {
      tempErrors.phone = 'Please enter a valid Bangladesh mobile number (e.g., 01712345678).';
    }

    // Selects validation
    if (!batch) {
      tempErrors.batch = 'Please select your batch.';
    }
    if (!role) {
      tempErrors.role = 'Please select your role.';
    }

    // Checkboxes validation
    if (!disclaimer) {
      tempErrors.disclaimer = 'You must agree to the disclaimer to proceed.';
    }
    if (!signature) {
      tempErrors.signature = 'You must accept the signature policy to proceed.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Format countdown seconds into MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError('');
    
    // Client-side validations
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/certificate/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          batch,
          role,
          disclaimer: disclaimer ? 'I agree to the above disclaimer.' : '',
          signature: signature ? 'Understand and Agree' : '',
          username, // Honeypot (bot-check)
          rTime: renderTimeRef.current // Rendering time (speed-check)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Clear all fields upon success
        setName('');
        setEmail('');
        setPhone('');
        setBatch('');
        setRole('');
        setDisclaimer(false);
        setSignature(false);
        setErrors({});
        // Start cooldown count with returned seconds (default 60)
        setCooldown({
          available: false,
          retryAfterSeconds: data.retryAfterSeconds ?? 60
        });
      } else {
        if (data.code === 'COOLDOWN_ACTIVE') {
          setCooldown({
            available: false,
            retryAfterSeconds: data.retryAfterSeconds ?? 60
          });
          setSubmitError('Another submission was recently completed. Please wait before submitting.');
        } else if (data.code === 'DUPLICATE') {
          setSubmitError(data.error || 'A certificate request has already been submitted using this email address or phone number.');
        } else if (data.code === 'INVALID_REQUEST') {
          setSubmitError(data.error || 'Please correct the information and try again.');
        } else {
          setSubmitError(data.error || "We couldn't submit your information right now. Please try again later.");
        }
      }
    } catch (err) {
      setSubmitError("We couldn't submit your information right now. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-32 pb-24 font-sans">
      <div className="absolute inset-0 bg-gradient-to-b from-baf-cyan/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Head Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-baf-cyan/10 border border-baf-cyan/20 rounded-full px-5 py-2 mb-6">
            <Award className="w-5 h-5 text-baf-cyan" />
            <span className="text-baf-cyan text-sm font-semibold tracking-wider uppercase">Official e-Cert</span>
          </div>
          <h1 className="font-serif font-black text-4xl sm:text-5xl text-white mb-6">
            BAFSDBC Certificate Information Form
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs text-white/30 font-medium uppercase tracking-widest">
            <Link to="/" className="hover:text-baf-cyan transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/50">e-Certificate Form</span>
          </div>
        </div>

        {/* Cooldown loading check state */}
        {isCheckingStatus && !success && (
          <div className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 sm:p-12 backdrop-blur-xl space-y-8 animate-pulse">
            <div className="flex flex-col items-center text-center space-y-4 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 mb-2">
                <Clock className="w-8 h-8" />
              </div>
              <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
              <div className="h-4 w-full bg-white/5 rounded-full" />
              <div className="h-4 w-5/6 bg-white/5 rounded-full" />
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col items-center space-y-3">
              <div className="h-3 w-1/3 bg-white/5 rounded-full" />
              <div className="h-8 w-24 bg-white/10 rounded-lg" />
            </div>
          </div>
        )}

        {/* Global Cooldown Panel */}
        {!isCheckingStatus && !cooldown.available && !success && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 sm:p-12 text-center backdrop-blur-xl flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6">
              <Clock className="w-8 h-8 text-baf-cyan" />
            </div>
            
            <h2 className="text-2xl font-bold font-serif mb-4">Another submission was recently completed.</h2>
            <p className="text-slate-400 text-sm max-w-md mb-8 leading-relaxed">
              We process certificates sequentially to ensure accurate generation and delivery. Please wait before registering your details.
            </p>
            
            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Next submission available in:</p>
              <div className="font-serif font-bold text-5xl tracking-widest text-baf-cyan">
                {formatTime(cooldown.retryAfterSeconds)}
              </div>
            </div>
            
            <button 
              onClick={fetchCooldownStatus} 
              className="mt-8 text-sm font-semibold text-baf-cyan/70 hover:text-baf-cyan flex items-center gap-2 transition-all py-2 px-4 rounded-full hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4" /> Recheck Status
            </button>
          </motion.div>
        )}

        {/* Success Panel */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 sm:p-12 text-center backdrop-blur-xl flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-baf-cyan/10 border border-baf-cyan/20 flex items-center justify-center text-baf-cyan mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h2 className="text-3xl font-bold font-serif mb-6">Submission Successful!</h2>
            
            <div className="text-slate-300 text-base leading-relaxed space-y-4 max-w-xl mb-10 text-left sm:text-center">
              <p>Your information has been submitted successfully. Your certificate will be sent to the email address you provided.</p>
              <p className="text-baf-cyan/80 font-medium">Please check your inbox, including the Spam or Promotions folder.</p>
            </div>

            <div className="border-t border-white/5 pt-8 w-full">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">Next submission will be available in:</p>
              <div className="font-serif font-bold text-3xl text-baf-cyan tracking-widest">
                {formatTime(cooldown.retryAfterSeconds)}
              </div>
            </div>
            
            <button 
              onClick={() => setSuccess(false)}
              disabled={!cooldown.available}
              className="mt-8 inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold rounded-full text-black bg-baf-cyan hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {cooldown.available ? "Submit Another Response" : `Available in ${formatTime(cooldown.retryAfterSeconds)}`}
            </button>
          </motion.div>
        )}

        {/* Certificate Form Panel */}
        {!isCheckingStatus && cooldown.available && !success && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-white/5 rounded-[2rem] p-8 sm:p-12 backdrop-blur-xl"
          >
            
            {/* Introductory Text */}
            <div className="border-b border-white/5 pb-8 mb-8">
              <h2 className="text-lg font-bold uppercase tracking-widest text-baf-cyan mb-4">Instructions</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Welcome to the official certificate information form of BAFSD Business Club.
              </p>
              <p className="text-slate-400 text-sm leading-relaxed font-semibold text-white/80">
                Please provide your correct information carefully. The submitted information will be used for certificate generation. Any spelling mistake or incorrect data provided by the participant will not be the responsibility of the club authority.
              </p>
            </div>

            {/* Error Message banner */}
            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 mb-8 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-400 text-sm font-medium">{submitError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              
              {/* Honeypot field - strictly hidden from real users */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="username">Leave this field blank</label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  tabIndex={-1}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* Name field */}
              <div>
                <label htmlFor="cert-name" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="cert-name"
                  type="text"
                  required
                  maxLength={100}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all text-white placeholder-slate-600 focus:outline-none ${
                    errors.name ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                />
                {errors.name && (
                  <p className="mt-2 text-xs font-semibold text-red-400" id="cert-name-error">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="cert-email" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="cert-email"
                  type="email"
                  required
                  maxLength={254}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all text-white placeholder-slate-600 focus:outline-none ${
                    errors.email ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                />
                <p className="mt-1.5 text-xs text-slate-500">This email address will be used to automatically deliver your certificate PDF.</p>
                {errors.email && (
                  <p className="mt-2 text-xs font-semibold text-red-400" id="cert-email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone number field */}
              <div>
                <label htmlFor="cert-phone" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input
                  id="cert-phone"
                  type="tel"
                  required
                  maxLength={30}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all text-white placeholder-slate-600 focus:outline-none ${
                    errors.phone ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="e.g., 01712345678"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                />
                {errors.phone && (
                  <p className="mt-2 text-xs font-semibold text-red-400" id="cert-phone-error">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Grid for Batch and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Batch select */}
                <div>
                  <label htmlFor="cert-batch" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cert-batch"
                    required
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all text-white focus:outline-none appearance-none certificate-select ${
                      errors.batch ? 'border-red-500 border-2' : 'border-white/10'
                    }`}
                    value={batch}
                    onChange={(e) => {
                      setBatch(e.target.value);
                      if (errors.batch) setErrors(prev => ({ ...prev, batch: '' }));
                    }}
                  >
                    <option value="" disabled>Select your batch</option>
                    {BATCHES.map((b) => (
                      <option key={b} value={b} className="bg-slate-950 text-white">{b}</option>
                    ))}
                  </select>
                  {errors.batch && (
                    <p className="mt-2 text-xs font-semibold text-red-400" id="cert-batch-error">
                      {errors.batch}
                    </p>
                  )}
                </div>

                {/* Role select */}
                <div>
                  <label htmlFor="cert-role" className="block text-sm font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Role in the Club/Event <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="cert-role"
                    required
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3.5 focus:border-baf-cyan focus:ring-1 focus:ring-baf-cyan outline-none transition-all text-white focus:outline-none appearance-none certificate-select ${
                      errors.role ? 'border-red-500 border-2' : 'border-white/10'
                    }`}
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      if (errors.role) setErrors(prev => ({ ...prev, role: '' }));
                    }}
                  >
                    <option value="" disabled>Select your role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-slate-950 text-white">{r}</option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="mt-2 text-xs font-semibold text-red-400" id="cert-role-error">
                      {errors.role}
                    </p>
                  )}
                </div>

              </div>

              {/* Disclaimer section */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-300">Disclaimer Section</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  I hereby confirm that all information provided above is accurate and final. The certificate will be issued based on the information submitted in this form. Each participant is eligible to receive only one certificate. Any duplicate submission, whether with the same or different information, may be rejected, and no additional certificate will be issued. BAFSD Business Club authority will not be responsible for any incorrect information submitted by the participant.
                </p>
                <div className="flex items-start gap-3 mt-4">
                  <input
                    id="cert-disclaimer"
                    type="checkbox"
                    required
                    className="w-5 h-5 rounded bg-slate-950 border border-white/20 text-baf-cyan focus:ring-0 cursor-pointer mt-0.5"
                    checked={disclaimer}
                    onChange={(e) => {
                      setDisclaimer(e.target.checked);
                      if (errors.disclaimer) setErrors(prev => ({ ...prev, disclaimer: '' }));
                    }}
                  />
                  <label htmlFor="cert-disclaimer" className="text-sm text-slate-300 cursor-pointer select-none">
                    I agree to the above disclaimer. <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.disclaimer && (
                  <p className="text-xs font-semibold text-red-400 mt-1">
                    {errors.disclaimer}
                  </p>
                )}
              </div>

              {/* Signature Section */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-300">Signature Section</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The signature field is being left blank. Participants must print the certificate/form and obtain the required signature from the respective madam(s) on the printed copy.
                </p>
                <div className="flex items-start gap-3 mt-4">
                  <input
                    id="cert-signature"
                    type="checkbox"
                    required
                    className="w-5 h-5 rounded bg-slate-950 border border-white/20 text-baf-cyan focus:ring-0 cursor-pointer mt-0.5"
                    checked={signature}
                    onChange={(e) => {
                      setSignature(e.target.checked);
                      if (errors.signature) setErrors(prev => ({ ...prev, signature: '' }));
                    }}
                  />
                  <label htmlFor="cert-signature" className="text-sm text-slate-300 cursor-pointer select-none">
                    Understand and Agree <span className="text-red-500">*</span>
                  </label>
                </div>
                {errors.signature && (
                  <p className="text-xs font-semibold text-red-400 mt-1">
                    {errors.signature}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <div className="flex justify-end border-t border-white/10 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-baf-cyan hover:bg-white text-black font-bold py-3.5 px-10 rounded-full flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-baf-cyan/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Information
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
}
