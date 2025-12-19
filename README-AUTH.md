Auth server (JWT) quickstart

Install dependencies:

```powershell
cd <project-root>
npm install
```

Run in dev mode:

```powershell
npm run start:dev
```

Endpoints:

- `POST /auth/register`  { "username": "user", "password": "pass" }
- `POST /auth/login`     (use same body) returns `{ access_token: "..." }`
- `GET /auth/profile`    (use `Authorization: Bearer <token>`) returns user info

Notes:

- Default seeded user: `test` / `test`.
- JWT secret can be set via `JWT_SECRET` environment variable.
