from fastapi import APIRouter
from . import speech, transactions, reports

router = APIRouter()

router.include_router(speech.router, prefix="/speech", tags=["speech"])
router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])
