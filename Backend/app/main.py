from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, ensure_schema
from app import models
from app.routers import auth_router, dashboard_router, inventories_router, items_router

# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(title="InvenTrack API")

# CORS must be registered before any route definitions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    models.Base.metadata.create_all(bind=engine)
    ensure_schema(engine)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {"message": "InvenTrack API"}


# ── Register routers ─────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(dashboard_router)
app.include_router(inventories_router)
app.include_router(items_router)
