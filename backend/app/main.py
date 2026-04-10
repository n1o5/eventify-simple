from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.routers import events, users, bookings, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Eventify API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/auth",     tags=["auth"])
app.include_router(users.router,    prefix="/api/users",    tags=["users"])
app.include_router(events.router,   prefix="/api/events",   tags=["events"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])

@app.get("/api/health")
def health():
    return {"status": "ok"}
