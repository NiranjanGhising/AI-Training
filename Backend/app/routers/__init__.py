from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.inventories import router as inventories_router
from app.routers.items import router as items_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "inventories_router",
    "items_router",
]
