# API Documentation

Base URL: `http://127.0.0.1:8000`

## Chat and conversations

- `POST /chat/` with `{ "message": "..." }`
- `GET /conversations/`
- `POST /conversations/` with `{ "title": "..." }`
- `GET /conversations/{id}`
- `POST /conversations/{id}/messages`
- `PUT /conversations/{id}/title`

## Complaints

- `GET /complaint/list`
- `GET /complaint/{ticket_id}`
- `GET /complaint/{ticket_id}/activity`
- `PUT /complaint/{ticket_id}/status`
- `PUT /complaint/{ticket_id}/priority`
- `PUT /complaint/{ticket_id}/category`
- `PUT /complaint/{ticket_id}/note`
- `PUT /complaint/{ticket_id}/assign`

## Agents and operations

- `POST /agent/create`
- `GET /agent/list`
- `GET /agent/{id}`
- `PUT /agent/{id}`
- `DELETE /agent/{id}`
- `GET /agent/{id}/workload`
- `POST /agent/auto-assign/{ticket_id}`
- `GET /notifications`
- `PUT /notifications/{id}/read`
- `DELETE /notifications/{id}`
- `GET /admin/stats`

## Authentication

- `POST /auth/register`
- `POST /auth/login`

Authentication currently issues JWTs. Before production, enforce role checks on admin, complaint, agent, and notification routes and never use the development `JWT_SECRET`.
