# Google Apps Script Setup Guide

This guide describes how to configure the Google Apps Script Web App, Google Form, and Vercel environments to enable the custom, website-themed certificate information form.

---

## Step 1: Manual Google Form Settings
Ensure the owner settings on your Google Form are configured exactly as follows to prevent authentication gates:
1. Open your Google Form in Google Drive.
2. Go to **Settings** (gear icon / tab).
3. Under **Responses**:
   - Set **Collect email addresses** to **Do not collect**.
   - Set **Restrict to users in [Organization Name] and its trusted organizations** to **OFF** (unchecked).
   - Set **Limit to 1 response** to **OFF** (unchecked).
4. Verify that the Form still contains the separate, manual **Email** question (a short-answer text field).
5. If the Google Sheet connected to your Google Form still contains an `Email address` column (generated automatically by Google Forms under the hood), **do not rename or delete it**. It may remain blank for future submissions.

---

## Step 2: Identify Google Form Action URL & Entry IDs
To submit responses programmatically, you must find the form's action URL and question entry IDs.
1. Open the public Google Form in your browser (click **Send** -> Link icon -> Copy link, and paste into a private window).
2. Right-click anywhere on the form and choose **Inspect** or press `F12` to open Developer Tools.
3. Open the **Elements** tab and search (`Ctrl + F`) for `<form`.
4. Locate the `action` attribute of the `<form>` element. It will look like this:
   `https://docs.google.com/forms/d/e/1FAIpQLSfXXXXXXXXXXXXX/formResponse`
   - Copy this URL. This is your `GOOGLE_FORM_ACTION_URL`.
5. Search for `name="entry.` inside the HTML to find the entry IDs mapping to each question:
   - Match each input name element to its question label (e.g., `Name`, `Email`, `Phone number`, etc.).
   - Example Entry IDs:
     - Name: `entry.1000001`
     - Email: `entry.1000002`
     - Phone number: `entry.1000003`
     - Batch: `entry.1000004`
     - Role in the Club/Event: `entry.1000005`
     - Disclaimer Section: `entry.1000006`
     - Signature Section: `entry.1000007`

---

## Step 3: Confirm Google Sheet Details
1. Open the Google Sheet connected to your Google Form.
2. Verify the headers on the first row are exactly:
   `Timestamp`, `Email address`, `Score`, `Name`, `Email`, `Phone number`, `Batch`, `Role in the Club/Event`, `Disclaimer Section`, `Signature Section`
3. Note down:
   - **Spreadsheet ID**: Found in the spreadsheet URL (`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`).
   - **Response Sheet Name**: The tab name at the bottom of the Sheet (usually `Form Responses 1`).

---

## Step 4: Deploy Google Apps Script Web App
1. Inside the Google Sheet, go to **Extensions** -> **Apps Script**.
2. Delete any default code in `Code.gs` and paste the contents of `google-apps-script/Code.gs`.
3. Save the project.
4. Set up Script Properties (configuration parameters):
   - Go to **Project Settings** (gear icon in the left-hand menu of Apps Script editor).
   - Under **Script Properties**, add the following properties:
     - `SHARED_SECRET`: Select a strong secret string (e.g., `s3cr3t_p4ss_f0r_b4fsdbc`).
     - `SPREADSHEET_ID`: Paste your Google Sheet ID.
     - `RESPONSE_SHEET_NAME`: Paste the sheet tab name (e.g., `Form Responses 1`).
     - `GOOGLE_FORM_ACTION_URL`: Paste the Google Form response URL.
     - `FORM_ENTRY_NAME`: `entry.1000001` (replace with your actual entry ID).
     - `FORM_ENTRY_EMAIL`: `entry.1000002` (replace with your actual entry ID).
     - `FORM_ENTRY_PHONE`: `entry.1000003` (replace with your actual entry ID).
     - `FORM_ENTRY_BATCH`: `entry.1000004` (replace with your actual entry ID).
     - `FORM_ENTRY_ROLE`: `entry.1000005` (replace with your actual entry ID).
     - `FORM_ENTRY_DISCLAIMER`: `entry.1000006` (replace with your actual entry ID).
     - `FORM_ENTRY_SIGNATURE`: `entry.1000007` (replace with your actual entry ID).
5. Deploy the Web App:
   - Click **Deploy** -> **New deployment**.
   - Select **Web app** as the deployment type.
   - **Description**: `BAFSDBC Certificate Bridge`
   - **Execute as**: `Me (your-email@gmail.com)`
   - **Who has access**: `Anyone` (this allows Vercel serverless functions to call it).
   - Click **Deploy**.
   - Copy the generated **Web app URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Step 5: Configure Vercel Environment Variables
Add the following variables to Vercel (or in your local `.env` file):
* `CERTIFICATE_APPS_SCRIPT_URL`: Paste the Google Apps Script Web App URL from Step 4.
* `CERTIFICATE_SHARED_SECRET`: Paste the same `SHARED_SECRET` you set in Step 4.
* `CERTIFICATE_ALLOWED_ORIGIN`: Set to your production domain (e.g., `https://bafsdbc.vercel.app`).

---

## Step 6: Testing & Validation
### Test 1: Duplicate Email
1. Fill out the website form using a brand new phone number but an email address already present in the `Email` column of the Google Sheet.
2. Try submitting. The website should display:
   `A certificate request has already been submitted using this email address or phone number.`
3. No row should be appended.

### Test 2: Duplicate Phone
1. Fill out the website form using a brand new email address but a phone number already present in the `Phone number` column of the Google Sheet.
2. Normalize checking (e.g. if the sheet has `01712345678` and you enter `+8801712-345678`).
3. Try submitting. The duplicate message should display.

### Test 3: 60-Second Cooldown
1. Submit a valid form.
2. Upon success, a timer should display indicating `Next submission available in 00:59`.
3. Immediately open the website `/certificate` page in another browser, device, or Incognito window.
4. The page should show: `Another submission was recently completed. Next submission available in: 00:XX` and lock the form fields.
5. Wait for the countdown to hit zero. The page should recheck availability from the server and enable the form.

### Test 4: AutoCrat Trigger Verification
1. Submit a successful request.
2. Confirm the row appears in the Google Sheet under the correct columns (`Name`, `Email`, `Phone number`, `Batch`, `Role in the Club/Event`, `Disclaimer Section`, `Signature Section`).
3. Confirm that the automatic system (AutoCrat) triggers correctly, generates the PDF, and sends the email containing the PDF attachment to the address in the `Email` column.

---

## Step 7: Rotating the Shared Secret
If the shared secret is ever compromised:
1. Generate a new strong random string.
2. Go to Google Apps Script -> **Project Settings** -> **Script Properties** -> Edit `SHARED_SECRET` to the new string. Save properties.
3. Update the `CERTIFICATE_SHARED_SECRET` environment variable in Vercel.
4. Redeploy or restart Vercel serverless functions.
