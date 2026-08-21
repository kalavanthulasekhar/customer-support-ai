from database.db import get_connection, init_db


class ConversationService:

    def __init__(self):
        self.create_tables()

    def create_tables(self):
        init_db()


    # Create new conversation
    def create_conversation(self, title="New Chat"):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO conversations (title)
            VALUES (?)
        """, (title,))

        conversation_id = cursor.lastrowid

        conn.commit()
        conn.close()

        return conversation_id


    # Get all conversations
    def get_conversations(self):

        conn = get_connection()
        cursor = conn.cursor()

        rows = cursor.execute("""
            SELECT
                id,
                title
            FROM conversations
            ORDER BY id DESC
        """).fetchall()

        conn.close()

        return [
            {
                "id": row["id"],
                "title": row["title"]
            }
            for row in rows
        ]


    # Get one conversation with messages
    def get_conversation(self, conversation_id):

        conn = get_connection()
        cursor = conn.cursor()

        conversation = cursor.execute("""
            SELECT id, title
            FROM conversations
            WHERE id = ?
        """, (conversation_id,)).fetchone()

        if not conversation:
            conn.close()
            return None

        messages = cursor.execute("""
            SELECT
                id,
                sender,
                message,
                agent
            FROM messages
            WHERE conversation_id = ?
            ORDER BY id ASC
        """, (conversation_id,)).fetchall()

        conn.close()

        return {
            "id": conversation["id"],
            "title": conversation["title"],
            "messages": [
                {
                    "id": message["id"],
                    "sender": message["sender"],
                    "message": message["message"],
                    "agent": message["agent"]
                }
                for message in messages
            ]
        }


    # Add message
    def add_message(
        self,
        conversation_id,
        sender,
        message,
        agent=None
    ):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO messages (
                conversation_id,
                sender,
                message,
                agent
            )
            VALUES (?, ?, ?, ?)
        """, (
            conversation_id,
            sender,
            message,
            agent
        ))

        conn.commit()
        conn.close()


    # Update conversation title
    def update_title(
        self,
        conversation_id,
        title
    ):

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE conversations
            SET title = ?
            WHERE id = ?
        """, (
            title,
            conversation_id
        ))

        conn.commit()

        updated = cursor.rowcount > 0

        conn.close()

        return updated