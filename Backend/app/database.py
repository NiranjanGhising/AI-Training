import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

SQLITE_URL = "sqlite:///./sql_app.db"
DATABASE_URL = os.getenv("DATABASE_URL")

def _build_engine():
    if DATABASE_URL:
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Connected to PostgreSQL database.")
            return engine
        except Exception as exc:
            print(f"WARNING: Could not connect to PostgreSQL ({exc}). Falling back to SQLite.")
    else:
        print("DATABASE_URL not set. Using SQLite.")

    return create_engine(SQLITE_URL, connect_args={"check_same_thread": False})


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema(engine) -> None:
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = {col["name"] for col in inspector.get_columns("users")}
        with engine.begin() as conn:
            if "name" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR"))
            if "created_at" not in columns:
                if engine.dialect.name == "postgresql":
                    conn.execute(
                        text(
                            "ALTER TABLE users ADD COLUMN created_at "
                            "TIMESTAMP WITH TIME ZONE DEFAULT NOW()"
                        )
                    )
                else:
                    conn.execute(
                        text(
                            "ALTER TABLE users ADD COLUMN created_at "
                            "DATETIME DEFAULT CURRENT_TIMESTAMP"
                        )
                    )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
