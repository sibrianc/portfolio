# models.py
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import Integer, String, Text, Boolean, DateTime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

#
from .extensions import db


# Mixin for timestamp fields
class TimestampMixin:
    # Use timezone-aware UTC datetimes
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),  # tells SQLAlchemy that this column stores tz-aware datetimes
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )


# User model for admin users
class User(UserMixin, db.Model, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(250), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(250), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)

    # --- Password helpers ---
    def set_password(self, raw: str) -> None:
        # NOTE: Use a strong hashing method
        self.password_hash = generate_password_hash(raw, method="pbkdf2:sha256", salt_length=8)

    def check_password(self, raw: str) -> bool:
        return check_password_hash(self.password_hash, raw)

# Project model for portfolio projects
class Project(db.Model, TimestampMixin):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    # English fields (default)
    title: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(140), unique=True, nullable=False)
    summary: Mapped[str] = mapped_column(String(280), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    
    # Spanish fields
    title_es: Mapped[str] = mapped_column(String(120), default="")
    summary_es: Mapped[str] = mapped_column(String(280), default="")
    description_es: Mapped[str] = mapped_column(Text, default="")
    
    # Language-agnostic fields
    tech_stack: Mapped[str] = mapped_column(String(240), default="")
    repo_url: Mapped[str] = mapped_column(String(240), default="")
    live_url: Mapped[str] = mapped_column(String(240), default="")
    cover_image: Mapped[str] = mapped_column(String(240), default="")
    video_url: Mapped[str] = mapped_column(String(240), default="")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)

# Contact message model for storing messages from the contact form
class ContactMessage(db.Model, TimestampMixin):
    __tablename__ = "contact_messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(240), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    processed: Mapped[bool] = mapped_column(Boolean, default=False)
