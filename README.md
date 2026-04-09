# Cloud based event management website - Vercel + Neon

| Service | Purpose |
|---------|---------|
| Vercel project 1 | Backend (FastAPI serverless) |
| Vercel project 2 | Frontend (React) |
| Neon | PostgreSQL (free forever) |

---

## Local Development

### Backend (uses SQLite locally)
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env
echo "DATABASE_URL=sqlite:///./eventify.db" >> .env
uvicorn app.main:app --reload --port 8000
```
API runs at http://localhost:8000/api/docs

### Frontend
```bash
cd frontend && npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```
App runs at http://localhost:5173

---

## Deploy (no card anywhere)

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "first commit"
git remote add origin https://github.com/YOUR_NAME/eventify.git
git push -u origin main
```

### 2. Free database — neon.tech
- Sign up with GitHub 
- New Project → name it eventify → Create
- Copy the Connection String 

### 3. Deploy backend — vercel.com
- Sign up with GitHub → Add New Project → import your repo
- Root Directory: backend
- Framework: Other, leave build/output fields empty
- Add environment variables:
  - DATABASE_URL = (paste Neon connection string)
  - SECRET_KEY = (run: openssl rand -hex 32, paste result)
- Deploy
- Your backend URL: https://eventify-xxx.vercel.app

### 4. Create admin user
Open https://your-backend.vercel.app/api/docs
Use POST /api/auth/register to create your account.
Then in Neon dashboard → SQL Editor, run:
  UPDATE users SET is_admin = true WHERE email = 'your@email.com';

### 5. Deploy frontend — vercel.com
- Add New Project → import SAME repo
- Root Directory: frontend
- Framework: Vite
- Add environment variable:
  - VITE_API_URL = https://your-backend.vercel.app
- Deploy

Done! Your app is live. Every git push auto-redeploys both projects.

---

## How the backend serverless works

backend/api/index.py just contains:
  from app.main import app

backend/vercel.json routes all requests to that file:
  { "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }] }

Vercel runs FastAPI as a serverless function. Each request spins up the
function, handles it, and shuts down. NullPool in database.py ensures
SQLAlchemy does not try to reuse database connections between invocations.

---

## API Endpoints

POST   /api/auth/register    - create account
POST   /api/auth/login       - get JWT token
GET    /api/events/          - list events
GET    /api/events/{id}      - event detail
POST   /api/events/          - create event (admin)
PUT    /api/events/{id}      - update event (admin)
DELETE /api/events/{id}      - delete event (admin)
GET    /api/bookings/my      - my bookings (user)
POST   /api/bookings/        - book tickets (user)
DELETE /api/bookings/{id}    - cancel booking (user)
GET    /api/health           - health check
