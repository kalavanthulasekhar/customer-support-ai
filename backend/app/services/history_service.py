from database.db import get_connection


class HistoryService:

    def save_chat(self, message, response, agent):

        conn = get_connection()

        conn.execute(
            """
            INSERT INTO chat_history
            (message, response, agent)
            VALUES (?, ?, ?)
            """,
            (message, response, agent)
        )

        conn.commit()
        conn.close()

    def get_history(self):

        conn = get_connection()

        rows = conn.execute(
            """
            SELECT id, message, response, agent, created_at
            FROM chat_history
            ORDER BY id DESC
            """
        ).fetchall()

        conn.close()

        return rows