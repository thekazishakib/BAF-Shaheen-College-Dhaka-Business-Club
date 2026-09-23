export default async function handler(req: any, res: any) {
  // Set Cache-Control header to prevent browser caching of status check
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    });
  }

  const appsScriptUrl = process.env.CERTIFICATE_APPS_SCRIPT_URL;
  const sharedSecret = process.env.CERTIFICATE_SHARED_SECRET;

  if (!appsScriptUrl || !sharedSecret) {
    return res.status(500).json({
      error: 'Server configuration error. Please try again later.',
      code: 'TEMPORARY_ERROR'
    });
  }

  try {
    // Call Google Apps Script Web App to get current cooldown status
    const url = new URL(appsScriptUrl);
    url.searchParams.append('secret', sharedSecret);

    // Fetch with a timeout of 10 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(502).json({
        error: "We couldn't submit your information right now. Please try again later.",
        code: 'TEMPORARY_ERROR'
      });
    }

    const data = await response.json();
    return res.status(200).json({
      available: data.available ?? true,
      retryAfterSeconds: data.retryAfterSeconds ?? 0
    });
  } catch (error) {
    // Never expose stack traces or internal URLs in response/logs
    return res.status(502).json({
      error: "We couldn't submit your information right now. Please try again later.",
      code: 'TEMPORARY_ERROR'
    });
  }
}
