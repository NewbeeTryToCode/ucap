from sqlalchemy.orm import Session
from sqlalchemy import text
from schemas.schemas import PrepareTranscriptRequest



def prepare_transcript_service(data: PrepareTranscriptRequest, db: Session):
    try:
        result = db.execute(
            text("""
                SELECT product_id,name, price FROM products
                WHERE umkm_id = :umkm_id AND is_active = TRUE
            """),
            {"umkm_id": data.umkm_id}
        ).fetchall()
    except Exception as e:
        print(f"DB ERROR: {e}")
        raise

    print(f"DB result: {result}")


    products = [{"product_id":row[0] ,"name": row[1], "price": float(row[2])} for row in result]

    return {
        "umkm_id": data.umkm_id,
        "transcript": data.transcript,
        "product_list": products
    }
