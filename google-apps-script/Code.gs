/**
 * BAFSDBC Certificate Management Google Apps Script
 *
 * This script runs as a Web App and acts as a bridge between the Vercel API backend
 * and the Google Sheet / Form system.
 */

function doGet(e) {
  try {
    var secret = e.parameter.secret;
    var expectedSecret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
    
    if (!expectedSecret || secret !== expectedSecret) {
      return jsonResponse({ error: "Unauthorized", code: "UNAUTHORIZED" }, 401);
    }

    var lastSubmit = PropertiesService.getScriptProperties().getProperty("LAST_SUBMIT_TIME");
    var available = true;
    var retryAfter = 0;
    
    if (lastSubmit) {
      var elapsed = Date.now() - parseInt(lastSubmit, 10);
      if (elapsed < 60000) {
        available = false;
        retryAfter = Math.ceil((60000 - elapsed) / 1000);
      }
    }

    return jsonResponse({
      available: available,
      retryAfterSeconds: retryAfter
    });
  } catch (err) {
    console.error("doGet internal error: " + err.toString());
    return jsonResponse({ error: "An unexpected error occurred", code: "INTERNAL_ERROR" }, 500);
  }
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return jsonResponse({ error: "Empty request body", code: "INVALID_REQUEST" }, 400);
    }
    
    var data = JSON.parse(e.postData.contents);
    var secret = data.secret;
    var expectedSecret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
    
    if (!expectedSecret || secret !== expectedSecret) {
      return jsonResponse({ error: "Unauthorized", code: "UNAUTHORIZED" }, 401);
    }
    
    // Extract input fields
    var inputName = cleanName(data.name);
    var inputEmail = String(data.email || "").trim();
    var inputPhone = String(data.phone || "").trim();
    var inputBatch = String(data.batch || "").trim();
    var inputRole = String(data.role || "").trim();
    var inputDisclaimer = String(data.disclaimer || "").trim();
    var inputSignature = String(data.signature || "").trim();
    
    // Server-side validation
    if (!inputName || inputName.length > 100) {
      return jsonResponse({ error: "Invalid name", code: "INVALID_REQUEST" }, 400);
    }
    if (!validateEmail(inputEmail) || inputEmail.length > 254) {
      return jsonResponse({ error: "Invalid email", code: "INVALID_REQUEST" }, 400);
    }
    if (!validateBangladeshPhone(inputPhone)) {
      return jsonResponse({ error: "Invalid Bangladesh phone number", code: "INVALID_REQUEST" }, 400);
    }
    if (!validateBatch(inputBatch)) {
      return jsonResponse({ error: "Invalid batch", code: "INVALID_REQUEST" }, 400);
    }
    if (!validateRole(inputRole)) {
      return jsonResponse({ error: "Invalid role", code: "INVALID_REQUEST" }, 400);
    }
    if (inputDisclaimer !== "I agree to the above disclaimer.") {
      return jsonResponse({ error: "Disclaimer not accepted", code: "INVALID_REQUEST" }, 400);
    }
    if (inputSignature !== "Understand and Agree") {
      return jsonResponse({ error: "Signature agreement not accepted", code: "INVALID_REQUEST" }, 400);
    }
    
    var normalizedEmail = inputEmail.toLowerCase();
    var normalizedPhone = normalizePhone(inputPhone);
    
    // Acquire Lock to prevent race conditions (wait up to 30 seconds)
    var lock = LockService.getScriptLock();
    try {
      if (!lock.tryLock(30000)) {
        return jsonResponse({ error: "Server is busy. Please try again.", code: "TEMPORARY_ERROR" }, 503);
      }
    } catch (lockError) {
      console.error("Lock service error: " + lockError.toString());
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "TEMPORARY_ERROR" }, 503);
    }
    
    // 1. Check global 60-second cooldown
    var lastSubmit = PropertiesService.getScriptProperties().getProperty("LAST_SUBMIT_TIME");
    if (lastSubmit) {
      var elapsed = Date.now() - parseInt(lastSubmit, 10);
      if (elapsed < 60000) {
        lock.releaseLock();
        var retryAfter = Math.ceil((60000 - elapsed) / 1000);
        return jsonResponse({ 
          error: "Another submission was recently completed. Please wait.", 
          code: "COOLDOWN_ACTIVE",
          retryAfterSeconds: retryAfter
        }, 429);
      }
    }
    
    // 2. Duplicate checking
    var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    var responseSheetName = PropertiesService.getScriptProperties().getProperty("RESPONSE_SHEET_NAME");
    
    if (!spreadsheetId || !responseSheetName) {
      lock.releaseLock();
      console.error("Spreadsheet configuration missing: SPREADSHEET_ID or RESPONSE_SHEET_NAME properties not defined.");
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "SERVER_CONFIG_ERROR" }, 500);
    }
    
    var ss;
    var sheet;
    try {
      ss = SpreadsheetApp.openById(spreadsheetId);
      sheet = ss.getSheetByName(responseSheetName);
    } catch (e) {
      lock.releaseLock();
      console.error("Failed to open response spreadsheet: " + e.toString());
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "SERVER_CONFIG_ERROR" }, 500);
    }
    
    if (!sheet) {
      lock.releaseLock();
      console.error("Response sheet not found: tab name '" + responseSheetName + "' does not exist.");
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "SERVER_CONFIG_ERROR" }, 500);
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var emailColIdx = -1;
      var phoneColIdx = -1;
      
      for (var i = 0; i < headers.length; i++) {
        var trimmedHeader = String(headers[i]).trim().toLowerCase();
        if (trimmedHeader === "email") {
          emailColIdx = i;
        } else if (trimmedHeader === "phone number") {
          phoneColIdx = i;
        }
      }
      
      if (emailColIdx === -1 || phoneColIdx === -1) {
        lock.releaseLock();
        console.error("Required columns 'Email' or 'Phone number' not found in spreadsheet headers.");
        return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "SERVER_CONFIG_ERROR" }, 500);
      }
      
      var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
      var rowValues = dataRange.getValues();
      
      for (var r = 0; r < rowValues.length; r++) {
        var row = rowValues[r];
        var rowEmail = String(row[emailColIdx] || "").trim().toLowerCase();
        var rowPhone = normalizePhone(String(row[phoneColIdx] || ""));
        
        if (rowEmail === normalizedEmail || rowPhone === normalizedPhone) {
          lock.releaseLock();
          return jsonResponse({ 
            error: "A certificate request has already been submitted using this email address or phone number.",
            code: "DUPLICATE"
          }, 409);
        }
      }
    }
    
    // 3. Post submission to the existing Google Form URL
    var formActionUrl = PropertiesService.getScriptProperties().getProperty("GOOGLE_FORM_ACTION_URL");
    if (!formActionUrl) {
      lock.releaseLock();
      console.error("Google Form Action URL script property not configured.");
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "SERVER_CONFIG_ERROR" }, 500);
    }
    
    var formPayload = {};
    formPayload[PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_NAME")] = inputName;
    formPayload[PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_EMAIL")] = inputEmail;
    formPayload[PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_PHONE")] = inputPhone;
    formPayload[PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_BATCH")] = inputBatch;
    formPayload[PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_ROLE")] = inputRole;
    formPayload[PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_DISCLAIMER")] = inputDisclaimer;
    formPayload[PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_SIGNATURE")] = inputSignature;
    
    var options = {
      method: "post",
      payload: formPayload,
      muteHttpExceptions: true
    };
    
    var response;
    try {
      response = UrlFetchApp.fetch(formActionUrl, options);
    } catch (fetchError) {
      lock.releaseLock();
      console.error("Failed to submit to Google Form: " + fetchError.toString());
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "TEMPORARY_ERROR" }, 502);
    }
    
    var responseCode = response.getResponseCode();
    if (responseCode < 200 || responseCode >= 300) {
      lock.releaseLock();
      console.error("Google Form rejected submission with status code: " + responseCode);
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "TEMPORARY_ERROR" }, 502);
    }
    
    var responseBody = response.getContentText();
    // Verify it is not a Google Login page redirection
    if (responseBody.indexOf("ServiceLogin") !== -1 || responseBody.indexOf("accounts.google.com") !== -1) {
      lock.releaseLock();
      console.error("Google Form requires Google sign-in. Access settings are incorrect on Form owner side.");
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "SERVER_CONFIG_ERROR" }, 500);
    }
    
    // Verify it is not a form validation error rendering the questions again
    var nameEntryId = PropertiesService.getScriptProperties().getProperty("FORM_ENTRY_NAME");
    if (nameEntryId && responseBody.indexOf(nameEntryId) !== -1) {
      lock.releaseLock();
      console.error("Google Form rejected submission due to form validation error (incorrect entry IDs or fields).");
      return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "SERVER_CONFIG_ERROR" }, 500);
    }
    
    // 4. Update the Cooldown Timestamp ONLY on confirmed Google Form success
    PropertiesService.getScriptProperties().setProperty("LAST_SUBMIT_TIME", String(Date.now()));
    
    // Release the Lock
    lock.releaseLock();
    
    return jsonResponse({
      success: true,
      code: "SUCCESS",
      retryAfterSeconds: 60
    });
    
  } catch (err) {
    console.error("doPost internal error: " + err.toString());
    return jsonResponse({ error: "We couldn't submit your information right now. Please try again later.", code: "INTERNAL_ERROR" }, 500);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function jsonResponse(data, status) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function cleanName(name) {
  if (!name) return "";
  // Trim spaces and collapse repeated internal spaces
  return String(name).trim().replace(/\s+/g, " ");
}

function validateEmail(email) {
  var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

function validateBangladeshPhone(phone) {
  var normalized = normalizePhone(phone);
  // Matches 01XXXXXXXXX (11 digits total starting with 01)
  return /^01[3-9]\d{8}$/.test(normalized);
}

function normalizePhone(phone) {
  if (!phone) return "";
  // Remove spaces, dashes, parentheses, plus signs
  var clean = String(phone).replace(/[\s\-\+\(\)]/g, "");
  // If it starts with 8801, remove the 88 prefix
  if (clean.indexOf("8801") === 0) {
    clean = clean.substring(2);
  }
  return clean;
}

function validateBatch(batch) {
  if (!batch || typeof batch !== "string") return false;
  var match = batch.match(/^HSC-(\d{4})$/);
  if (!match) return false;
  var year = parseInt(match[1], 10);
  return year >= 2014 && year <= 2050;
}

function validateRole(role) {
  var validRoles = [
    "President", "Vice President", "General Secretary", "Dir. Of IT",
    "Dir. Graphics & Media", "Dir. Organising", "Dir. Event Management",
    "Dir. Public Relation", "Dir. Adroit", "Dir. Photography",
    "Section Rep", "General Member"
  ];
  return validRoles.indexOf(role) !== -1;
}
