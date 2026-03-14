import os
import logging
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

logger = logging.getLogger("airbase-ops")

app = FastAPI(title="AirBase Ops API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
def _startup_checks():
    """Security: warn on missing secrets at startup."""
    if not os.environ.get("OPENROUTER_API_KEY"):
        logger.warning(
            "⚠️  OPENROUTER_API_KEY is not set! "
            "AI Advisor features will be disabled. "
            "Set this in your .env file to enable AI."
        )
    else:
        logger.info("✅ OPENROUTER_API_KEY detected — AI Advisor enabled.")
