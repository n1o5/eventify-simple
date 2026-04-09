from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id               = Column(Integer, primary_key=True, index=True)
    email            = Column(String(255), unique=True, index=True, nullable=False)
    username         = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password  = Column(String(255), nullable=False)
    is_admin         = Column(Boolean, default=False)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    bookings         = relationship("Booking", back_populates="user")

class Event(Base):
    __tablename__ = "events"
    id                = Column(Integer, primary_key=True, index=True)
    title             = Column(String(255), nullable=False)
    description       = Column(Text)
    location          = Column(String(255))
    event_date        = Column(DateTime(timezone=True), nullable=False)
    total_tickets     = Column(Integer, nullable=False)
    available_tickets = Column(Integer, nullable=False)
    price             = Column(Float, default=0.0)
    category          = Column(String(100))
    image_url         = Column(String(500))
    created_by        = Column(Integer, ForeignKey("users.id"))
    created_at        = Column(DateTime(timezone=True), server_default=func.now())
    is_active         = Column(Boolean, default=True)
    bookings          = relationship("Booking", back_populates="event")

class Booking(Base):
    __tablename__ = "bookings"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id    = Column(Integer, ForeignKey("events.id"), nullable=False)
    quantity    = Column(Integer, nullable=False, default=1)
    total_price = Column(Float, nullable=False)
    status      = Column(String(50), default="confirmed")
    booking_ref = Column(String(20), unique=True, index=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    user        = relationship("User", back_populates="bookings")
    event       = relationship("Event", back_populates="bookings")
