from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.models import Event, User

router = APIRouter()

class EventIn(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    event_date: datetime
    total_tickets: int
    price: float = 0.0
    category: Optional[str] = None
    image_url: Optional[str] = None

class EventOut(BaseModel):
    id: int; title: str; description: Optional[str]; location: str
    event_date: datetime; total_tickets: int; available_tickets: int
    price: float; category: Optional[str]; image_url: Optional[str]
    is_active: bool; created_at: datetime
    class Config: from_attributes = True

@router.get("/", response_model=List[EventOut])
def list_events(category: Optional[str] = None, search: Optional[str] = None,
                skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    q = db.query(Event).filter(Event.is_active == True)
    if category: q = q.filter(Event.category == category)
    if search:   q = q.filter(Event.title.ilike(f"%{search}%"))
    return q.order_by(Event.event_date).offset(skip).limit(limit).all()

@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev: raise HTTPException(404, "Event not found")
    return ev

@router.post("/", response_model=EventOut, status_code=201)
def create_event(body: EventIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ev = Event(**body.dict(), available_tickets=body.total_tickets, created_by=admin.id)
    db.add(ev); db.commit(); db.refresh(ev)
    return ev

@router.put("/{event_id}", response_model=EventOut)
def update_event(event_id: int, body: EventIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev: raise HTTPException(404, "Event not found")
    for k, v in body.dict().items(): setattr(ev, k, v)
    db.commit(); db.refresh(ev); return ev

@router.delete("/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev: raise HTTPException(404, "Event not found")
    ev.is_active = False; db.commit()
