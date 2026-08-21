import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.core.config import settings
from database.db import get_connection, init_db


class AuthService:
    def __init__(self):
        init_db()

    @staticmethod
    def hash_password(password):
        salt = secrets.token_bytes(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120_000)
        return f"{salt.hex()}${digest.hex()}"

    @staticmethod
    def verify_password(password, stored_hash):
        salt_hex, digest_hex = stored_hash.split("$", 1)
        expected = hashlib.pbkdf2_hmac(
            "sha256", password.encode(), bytes.fromhex(salt_hex), 120_000
        )
        return hmac.compare_digest(expected.hex(), digest_hex)

    def register(self, email, password, role="CUSTOMER"):
        role = role.upper()
        if role not in {"ADMIN", "SUPPORT_AGENT", "CUSTOMER"}:
            raise ValueError("Invalid role")
        conn = get_connection()
        try:
            cursor = conn.execute(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                (email.lower().strip(), self.hash_password(password), role),
            )
            conn.commit()
            return {"id": cursor.lastrowid, "email": email.lower().strip(), "role": role}
        finally:
            conn.close()

    def login(self, email, password):
        conn = get_connection()
        try:
            user = conn.execute(
                "SELECT id, email, password_hash, role FROM users WHERE email = ?",
                (email.lower().strip(),),
            ).fetchone()
        finally:
            conn.close()
        if not user or not self.verify_password(password, user["password_hash"]):
            return None
        expires = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
        token = jwt.encode(
            {"sub": str(user["id"]), "email": user["email"], "role": user["role"], "exp": expires},
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM,
        )
        return {"access_token": token, "token_type": "bearer", "user": {"id": user["id"], "email": user["email"], "role": user["role"]}}
