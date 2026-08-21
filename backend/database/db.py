import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DB_NAME = BASE_DIR / "complaints.db"


def get_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def add_column_if_not_exists(conn, table_name, column_name, column_definition):
    """
    Safely add a column to an existing SQLite table.
    """

    columns = conn.execute(f"PRAGMA table_info({table_name})").fetchall()

    existing_columns = [
        col["name"] if isinstance(col, sqlite3.Row) else col[1] for col in columns
    ]

    if column_name not in existing_columns:
        conn.execute(
            f"""
            ALTER TABLE {table_name}
            ADD COLUMN {column_name} {column_definition}
            """
        )


def init_db():

    conn = get_connection()

    # ==========================================
    # COMPLAINTS TABLE
    # ==========================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE NOT NULL,
            customer_message TEXT NOT NULL,

            status TEXT DEFAULT 'OPEN',

            priority TEXT DEFAULT 'MEDIUM',

            category TEXT DEFAULT 'OTHER',

            sentiment TEXT DEFAULT 'NEUTRAL',

            urgency TEXT DEFAULT 'LOW',

            recommended_action TEXT DEFAULT '',

            admin_note TEXT,

            assigned_to TEXT,

            assigned_agent_id INTEGER,

            sla_deadline TIMESTAMP,

            sla_status TEXT DEFAULT 'ON_TRACK',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    # ==========================================
    # DATABASE MIGRATION FOR EXISTING DATABASES
    # ==========================================

    add_column_if_not_exists(
        conn, "complaints", "priority", "TEXT DEFAULT 'MEDIUM'"
    )

    add_column_if_not_exists(
        conn, "complaints", "category", "TEXT DEFAULT 'OTHER'"
    )

    add_column_if_not_exists(
        conn, "complaints", "sentiment", "TEXT DEFAULT 'NEUTRAL'"
    )

    add_column_if_not_exists(conn, "complaints", "urgency", "TEXT DEFAULT 'LOW'")

    add_column_if_not_exists(conn, "complaints", "recommended_action", "TEXT")

    add_column_if_not_exists(conn, "complaints", "admin_note", "TEXT")

    add_column_if_not_exists(conn, "complaints", "assigned_to", "TEXT")

    add_column_if_not_exists(conn, "complaints", "assigned_agent_id", "INTEGER")

    add_column_if_not_exists(conn, "complaints", "sla_deadline", "TIMESTAMP")

    add_column_if_not_exists(
        conn, "complaints", "sla_status", "TEXT DEFAULT 'ON_TRACK'"
    )

    add_column_if_not_exists(conn, "complaints", "created_at", "TIMESTAMP")

    # ==========================================
    # CHAT HISTORY TABLE
    # ==========================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            response TEXT,
            agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    # ==========================================
    # CONVERSATIONS TABLE
    # ==========================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """
    )

    # ==========================================
    # MESSAGES TABLE
    # ==========================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (conversation_id)
            REFERENCES conversations(id)
            ON DELETE CASCADE
        )
    """
    )

    # ==========================================
    # COMPLAINT ACTIVITY HISTORY TABLE
    # ==========================================

    conn.execute(
        """
       CREATE TABLE IF NOT EXISTS complaint_activity (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           ticket_id TEXT NOT NULL,
           action_type TEXT NOT NULL,
           old_value TEXT,
           new_value TEXT,
           description TEXT,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (ticket_id)
        REFERENCES complaints(ticket_id)
        ON DELETE CASCADE
        )
    """
    )

    # ==========================================
    # SUPPORT AGENTS
    # ==========================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            team TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'AVAILABLE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # ==========================================
    # NOTIFICATIONS
    # ==========================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_type TEXT NOT NULL,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # ==========================================
    # USERS AND ROLES
    # ==========================================

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'CUSTOMER',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    conn.commit()
    conn.close()

    print(f"Database initialized successfully: {DB_NAME}")


if __name__ == "__main__":
    init_db()