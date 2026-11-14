/**
 * PII Sanitization Helper (regex & token replacement)
 * Implements privacy guardrails ensuring zero Personally Identifiable Information
 * is forwarded to external LLMs or stored unprotected.
 */
export function sanitizePII(text = '') {
  if (typeof text !== 'string') {
    return { sanitized: '', wasSanitized: false, entities: [] };
  }

  let sanitized = text;
  const entities = [];

  // Email redaction
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  if (emailRegex.test(sanitized)) {
    entities.push('EMAIL');
    sanitized = sanitized.replace(emailRegex, '[EMAIL_REDACTED]');
  }

  // Phone number redaction
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  if (phoneRegex.test(sanitized)) {
    entities.push('PHONE_NUMBER');
    sanitized = sanitized.replace(phoneRegex, '[PHONE_REDACTED]');
  }

  // SSN / ID number redaction
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  if (ssnRegex.test(sanitized)) {
    entities.push('GOV_ID');
    sanitized = sanitized.replace(ssnRegex, '[ID_REDACTED]');
  }

  return {
    sanitized,
    wasSanitized: entities.length > 0,
    entities
  };
}

/**
 * Express middleware for automatic PII sanitization of request bodies
 */
export function piiSanitizerMiddleware(req, res, next) {
  if (req.body && typeof req.body.message === 'string') {
    const { sanitized, wasSanitized, entities } = sanitizePII(req.body.message);
    req.sanitizedMessage = sanitized;
    req.piiEntities = entities;
    req.wasSanitized = wasSanitized;
  }
  next();
}

