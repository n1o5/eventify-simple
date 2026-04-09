# 🎟 Eventify — Simple Edition
**FastAPI + React | Deployed on Render + Vercel | 100% Free**

---

## Project Structure

```
eventify-simple/
├── backend/              → FastAPI (deploys to Render)
│   ├── app/
│   │   ├── main.py
│   │   ├── core/         → config, database, security
│   │   ├── models/       → SQLAlchemy ORM models
│   │   └── routers/      → auth, events, bookings, users
│   ├── tests/
│   └── requirements.txt
├── frontend/             → React + Vite (deploys to Vercel)
│   ├── src/
│   │   ├── api/api.js    → all fetch calls
│   │   ├── components/
│   │   └── pages/
│   ├── vercel.json       → SPA routing fix
│   └── package.json
├── render.yaml           → Render Blueprint (backend + DB in one click)
└── .github/workflows/    → CI/CD pipeline
```

---

## Local Development

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create a .env file
echo "SECRET_KEY=$(openssl rand -hex 32)" > .env
echo "DATABASE_URL=sqlite:///./eventify.db" >> .env

uvicorn app.main:app --reload
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/api/docs
```

### Frontend
```bash
cd frontend
npm install

# Create .env.local pointing to local backend
echo "VITE_API_URL=http://localhost:8000" > .env.local

npm run dev
# App runs at http://localhost:5173
```

---

## Deploy to Render + Vercel (Free)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/eventify-simple.git
git push -u origin main
```

### Step 2 — Deploy backend on Render
1. Go to **render.com** → Sign up → New → **Blueprint**
2. Connect your GitHub repo
3. Render reads `render.yaml` and automatically creates:
   - A FastAPI web service
   - A free PostgreSQL database (linked automatically)
4. Click **Apply** — deployment takes ~3 minutes
5. Copy your backend URL: `https://eventify-backend.onrender.com`

### Step 3 — Create your admin user
In Render dashboard → your service → **Shell** tab:
```python
from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import hash_password
db = SessionLocal()
db.add(User(username='admin', email='admin@example.com',
            hashed_password=hash_password('admin123'), is_admin=True))
db.commit()
print('Done')
```

### Step 4 — Deploy frontend on Vercel
1. Go to **vercel.com** → New Project → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://eventify-backend.onrender.com` (your Render URL)
4. Click **Deploy**

Your app is live at `https://your-project.vercel.app` 🎉

---

## CI/CD (GitHub Actions)

On every `git push` to `main`:
1. Runs backend tests (pytest)
2. Triggers Render redeploy via webhook
3. Vercel auto-deploys from the push directly

### Add the Render deploy hook secret
In Render dashboard → your service → Settings → **Deploy Hook** → copy URL
In GitHub → Settings → Secrets → `RENDER_DEPLOY_HOOK_URL` → paste

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Get JWT token |
| GET | /api/events/ | — | List all events |
| GET | /api/events/{id} | — | Event detail |
| POST | /api/events/ | Admin | Create event |
| PUT | /api/events/{id} | Admin | Update event |
| DELETE | /api/events/{id} | Admin | Delete event |
| GET | /api/bookings/my | User | My bookings |
| POST | /api/bookings/ | User | Book tickets |
| DELETE | /api/bookings/{id} | User | Cancel booking |
| GET | /api/health | — | Health check |

Full interactive docs: `https://your-backend.onrender.com/api/docs`

---

## ⚠️ Render Free Tier Note
The free backend **sleeps after 15 min of inactivity** and takes ~30s to wake up.
Fix this for free: sign up at **uptimerobot.com** and add a monitor that pings
`https://your-backend.onrender.com/api/health` every 10 minutes.
