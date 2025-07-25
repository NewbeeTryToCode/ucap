from sqlalchemy import create_eingine, text
from typing import List, Dict

#get all product with umkm id
def get_products_for_umkm(umkm_id: int, transcript: str, engine) -> List[Dict]:
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT name, price FROM products
            WHERE umkm_id = :umkm_id AND is_active = TRUE
        """), {"umkm_id":umkm_id}).fetchall()
    product_list =  [{"name"L row[0], "price": float(row[1])} for row in result]

    return {
        "umkm_id": umkm_id,
        "transcript": transcript,
        "product_list": product_list
    } 