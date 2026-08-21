from database.db import get_connection


class NotificationService:
    def list_notifications(self, user_type="AGENT", user_id=None, unread_only=False):
        conn = get_connection()
        try:
            query = """
                SELECT id, user_type, user_id, title, message, is_read, created_at
                FROM notifications WHERE user_type = ?
            """
            params = [user_type]
            if user_id is not None:
                query += " AND user_id = ?"
                params.append(user_id)
            if unread_only:
                query += " AND is_read = 0"
            query += " ORDER BY id DESC"
            return [dict(row) for row in conn.execute(query, params).fetchall()]
        finally:
            conn.close()

    def mark_read(self, notification_id):
        conn = get_connection()
        try:
            cursor = conn.execute(
                "UPDATE notifications SET is_read = 1 WHERE id = ?",
                (notification_id,),
            )
            conn.commit()
            return bool(cursor.rowcount)
        finally:
            conn.close()

    def delete(self, notification_id):
        conn = get_connection()
        try:
            cursor = conn.execute("DELETE FROM notifications WHERE id = ?", (notification_id,))
            conn.commit()
            return bool(cursor.rowcount)
        finally:
            conn.close()
