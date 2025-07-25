from pydantic import BaseModel, Field
from typing import List, Literal

from typing import Optional


class PrepareTranscriptRequest(BaseModel):
    umkm_id: int
    transcript: str

class Product(BaseModel):
    product_id: int
    name: str
    price: float

class ParseTranscriptRequest(BaseModel):
    umkm_id: int
    transcript: str
    product_list: List[Product]

class TransactionItem(BaseModel):
    product_id: int
    name: Optional[str] = None
    quantity: int
    unit_price: float
class TransactionFromLLM(BaseModel):
    umkm_id: int
    transaction_type: Literal["sale", "purchase"]
    supplier_id: int | None = None  # opsional untuk `sale`
    transcript: str = ""
    items: List[TransactionItem]

class TransactionRequest(BaseModel):
    umkm_id: int

class MonthlyTransaction(BaseModel):
    umkm_id: int
    year: int
    month: int
