// Regular expressions for server-side validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const BATCH_START_YEAR = 2014;
const BATCHES = Array.from({ length: 2050 - BATCH_START_YEAR + 1 }, (_, i) => "HSC-" + (BATCH_START_YEAR + i));
const ROLES = [
  "President", "Vice President", "General Secretary", "Dir. Of IT",
  "Dir. Graphics & Media", "Dir. Organising", "Dir. Event Management",
  "Dir. Public Relation", "Dir. Adroit", "Dir. Photography",
  "Section Rep", "General Member"
];

function normalizePhone(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/[\s\-\+\(\)]/g, "");
  if (clean.startsWith("8801")) {
    return clean.substring(2);
  }
  return clean;
}

export default async function handler(req: any, res: any) {
  // Set Cache-Control header to prevent any caching of submit actions
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  const appsScriptUrl = process.env.CERTIFICATE_APPS_SCRIPT_URL;
  const sharedSecret = process.env.CERTIFICATE_SHARED_SECRET;
  const allowedOrigin = process.env.CERTIFICATE_ALLOWED_ORIGIN;

  if (!appsScriptUrl || !sharedSecret) {
    return res.status(500).json({
      error: 'Server configuration error. Please try again later.',
      code: 'TEMPORARY_ERROR'
    });
  }

  // Optional CORS origin verification if allowedOrigin is configured
  if (allowedOrigin && req.headers.origin && req.headers.origin !== allowedOrigin) {
    return res.status(403).json({
      error: 'Forbidden request origin',
      code: 'INVALID_REQUEST'
    });
  }

  try {
    const { name, email, phone, batch, role, disclaimer, signature, username, rTime } = req.body || {};

    // 1. Honeypot check: If the hidden honeypot field 'username' is filled, reject immediately
    if (username) {
      return res.status(400).json({
        error: 'Invalid submission request',
        code: 'INVALID_REQUEST'
      });
    }

    // 2. Render time check: Reject if the form was submitted too fast (under 3 seconds)
    const renderTime = Number(rTime);
    if (!renderTime || isNaN(renderTime) || Date.now() - renderTime < 3000) {
      return res.status(400).json({
        error: 'Invalid submission request',
        code: 'INVALID_REQUEST'
      });
    }

    // 3. Clean and validate inputs
    const cleanName = (name || "").trim().replace(/\s+/g, " ");
    const cleanEmail = (email || "").trim();
    const cleanPhone = (phone || "").trim();
    const cleanBatch = (batch || "").trim();
    const cleanRole = (role || "").trim();
    const cleanDisclaimer = (disclaimer || "").trim();
    const cleanSignature = (signature || "").trim();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({ error: 'Name is required (max 100 characters)', code: 'INVALID_REQUEST' });
    }
    if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Valid email is required (max 254 characters)', code: 'INVALID_REQUEST' });
    }
    
    // Normalize and validate Bangladesh mobile number
    const normalizedPhone = normalizePhone(cleanPhone);
    if (!cleanPhone || cleanPhone.length > 30 || !/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Valid Bangladesh mobile number is required', code: 'INVALID_REQUEST' });
    }

    if (!cleanBatch || !BATCHES.includes(cleanBatch)) {
      return res.status(400).json({ error: 'Valid batch is required', code: 'INVALID_REQUEST' });
    }
    if (!cleanRole || !ROLES.includes(cleanRole)) {
      return res.status(400).json({ error: 'Valid role is required', code: 'INVALID_REQUEST' });
    }
    if (cleanDisclaimer !== 'I agree to the above disclaimer.') {
      return res.status(400).json({ error: 'Disclaimer acceptance is required', code: 'INVALID_REQUEST' });
    }
    if (cleanSignature !== 'Understand and Agree') {
      return res.status(400).json({ error: 'Signature acceptance is required', code: 'INVALID_REQUEST' });
    }

    // 4. Forward details to Apps Script Web App
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const forwardPayload = {
      secret: sharedSecret,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      batch: cleanBatch,
      role: cleanRole,
      disclaimer: cleanDisclaimer,
      signature: cleanSignature
    };

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(forwardPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    const status = response.status;

    if (status === 200) {
      return res.status(200).json({
        success: true,
        code: 'SUCCESS',
        retryAfterSeconds: data.retryAfterSeconds ?? 60
      });
    }

    if (status === 409) {
      return res.status(409).json({
        error: data.error || 'A certificate request has already been submitted using this email address or phone number.',
        code: 'DUPLICATE'
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: data.error || 'Another submission was recently completed. Please wait before submitting.',
        code: 'COOLDOWN_ACTIVE',
        retryAfterSeconds: data.retryAfterSeconds ?? 60
      });
    }

    if (status === 400) {
      return res.status(400).json({
        error: data.error || 'Invalid request details provided.',
        code: 'INVALID_REQUEST'
      });
    }

    // Default error response for status codes like 500, 502, 503, etc.
    return res.status(502).json({
      error: "We couldn't submit your information right now. Please try again later.",
      code: 'TEMPORARY_ERROR'
    });

  } catch (error) {
    // Never expose stack traces or internal details in responses or logs
    return res.status(502).json({
      error: "We couldn't submit your information right now. Please try again later.",
      code: 'TEMPORARY_ERROR'
    });
  }
}
