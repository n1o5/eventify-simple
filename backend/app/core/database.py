from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.core.config import settings

# Neon gives postgres:// — SQLAlchemy needs postgresql://
url = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)

# NullPool is critical for serverless — each function call
# gets a fresh connection instead of trying to reuse pooled ones
# that may have timed out between invocations
engine = create_engine(url, poolclass=NullPool)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
