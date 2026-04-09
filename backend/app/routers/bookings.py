import random, string
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Booking, Event, User

router = APIRouter()

def gen_ref(): return "".join(random.choices(string.ascii_uppercase + string.digits, k=10))

class BookingIn(BaseModel):
    event_id: int
    quantity: int = 1

class BookingOut(BaseModel):
    id: int; event_id: int; quantity: int; total_price: float
    status: str; booking_ref: str; created_at: str = ""
    class Config: from_attributes = True

@router.get("/my", response_model=List[BookingOut])
def my_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Booking).filter(Booking.user_id == user.id).order_by(Booking.id.desc()).all()

@router.post("/", response_model=BookingOut, status_code=201)
def create_booking(body: BookingIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ev = db.query(Event).filter(Event.id == body.event_id, Event.is_active == True).first()
    if not ev: raise HTTPException(404, "Event not found")
    if ev.available_tickets < body.quantity:
        raise HTTPException(400, f"Only {ev.available_tickets} tickets left")
    ev.available_tickets -= body.quantity
    b = Booking(user_id=user.id, event_id=ev.id, quantity=body.quantity,
                total_price=ev.price * body.quantity, booking_ref=gen_ref())
    db.add(b); db.commit(); db.refresh(b); return b

@router.delete("/{booking_id}", status_code=204)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    b = db.query(Booking).filter(Booking.id == booking_id, Booking.user_id == user.id).first()
    if not b: raise HTTPException(404, "Booking not found")
    if b.status == "cancelled": raise HTTPException(400, "Already cancelled")
    ev = db.query(Event).filter(Event.id == b.event_id).first()
    if ev: ev.available_tickets += b.quantity
    b.status = "cancelled"; db.commit()
