import re

def sanitize_pii(text: str) -> dict:
    """
    Sanitize Personally Identifiable Information (PII)
    Redacts emails, phone numbers, and government/SSN IDs before external AI transmission.
    """
    if not isinstance(text, str):
        return {"sanitized": "", "was_sanitized": False, "entities": []}

    sanitized = text
    entities = []

    # Email redaction
    email_regex = r'[\w\.-]+@[\w\.-]+\.\w+'
    if re.search(email_regex, sanitized):
        entities.append("EMAIL")
        sanitized = re.sub(email_regex, "[EMAIL_REDACTED]", sanitized)

    # Phone number redaction
    phone_regex = r'\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
    if re.search(phone_regex, sanitized):
        entities.append("PHONE_NUMBER")
        sanitized = re.sub(phone_regex, "[PHONE_REDACTED]", sanitized)

    # SSN / Gov ID redaction
    ssn_regex = r'\b\d{3}-\d{2}-\d{4}\b'
    if re.search(ssn_regex, sanitized):
        entities.append("GOV_ID")
        sanitized = re.sub(ssn_regex, "[ID_REDACTED]", sanitized)

    return {
        "sanitized": sanitized,
        "was_sanitized": len(entities) > 0,
        "entities": entities
    }

