import os
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def get_encryption_key() -> bytes:
    key_hex = os.environ.get("MINDMITRA_ENCRYPTION_KEY_256", "")
    if len(key_hex) == 64:
        return bytes.fromhex(key_hex)
    jwt_secret = os.environ.get("JWT_SECRET", "mindmitra-super-secret-key-2026")
    return hashlib.sha256(jwt_secret.encode('utf-8')).digest()

def encrypt_field(plain_text: str) -> dict:
    """
    Encrypt plaintext using AES-256-GCM.
    Returns ciphertext, iv, and tag in hex format.
    """
    if not plain_text:
        return {"ciphertext": "", "iv": "", "tag": ""}

    key = get_encryption_key()
    aesgcm = AESGCM(key)
    iv = os.urandom(12)
    # AESGCM.encrypt appends 16-byte auth tag at the end
    encrypted_payload = aesgcm.encrypt(iv, plain_text.encode('utf-8'), None)
    ciphertext = encrypted_payload[:-16]
    tag = encrypted_payload[-16:]

    return {
        "ciphertext": ciphertext.hex(),
        "iv": iv.hex(),
        "tag": tag.hex()
    }

def decrypt_field(ciphertext_hex: str, iv_hex: str, tag_hex: str) -> str:
    """
    Decrypt AES-256-GCM ciphertext using IV and auth tag.
    """
    if not ciphertext_hex or not iv_hex or not tag_hex:
        return ""

    key = get_encryption_key()
    aesgcm = AESGCM(key)
    iv = bytes.fromhex(iv_hex)
    combined = bytes.fromhex(ciphertext_hex) + bytes.fromhex(tag_hex)
    decrypted_bytes = aesgcm.decrypt(iv, combined, None)
    return decrypted_bytes.decode('utf-8')

