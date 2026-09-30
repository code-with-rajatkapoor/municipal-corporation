# Municipal Citizen Complaint Portal — Backend

A starter production-oriented REST API for the municipal complaint portal.

## Included
- JWT citizen/officer/admin authentication
- SQLite persistence
- Complaint registration with generated `MCC-YYYY-XXXXXX` IDs
- Complaint status timeline
- Photo/video evidence upload
- Citizen complaint listing and tracking
- Officer/admin status updates and assignment
- Citizen ratings, comments and reopen requests
- Admin analytics endpoints
- Category → department routing
- Environment-based secrets

## Run
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set a strong `JWT_SECRET`.
3. Run `npm install`.
4. Run `npm start` (or `npm run dev`).
5. API: `http://localhost:4000`.

## Main endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `POST /api/complaints` — multipart form; evidence field accepts up to 10 files
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id/status` — officer/admin
- `POST /api/complaints/:id/feedback`
- `GET /api/admin/stats` — officer/admin
- `GET /api/health`

## Frontend integration
Store the returned JWT in the frontend session and send:
`Authorization: Bearer <token>`

For complaint creation, send `multipart/form-data` with `category`, `description`, `priority`, `ward`, `location_text`, optional `latitude`/`longitude`, and one or more `evidence` files.

Do not put `JWT_SECRET`, database credentials, service-role keys, or other private secrets in browser JavaScript.
