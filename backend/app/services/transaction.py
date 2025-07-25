from sqlalchemy.orm import Session
from sqlalchemy import text
from schemas.schemas import TransactionFromLLM

def create_transaction_from_llm(payload: TransactionFromLLM, db: Session):
    try:
        # Hitung total amount
        total_amount = sum(i.quantity * i.unit_price for i in payload.items)
        print(f"total amount: {total_amount}")
        if payload.transaction_type == "sale":
            tx = db.execute(text("""
                INSERT INTO sales (umkm_id, customer_name, total_amount, transcript, status)
                VALUES (:umkm_id, :customer_name, :total_amount, :transcript, :status)
                RETURNING sale_id
            """), {
                "umkm_id": payload.umkm_id,
                "customer_name": "Auto (LLM)",
                "total_amount": total_amount,
                "transcript": payload.transcript,
                "status": "selesai"
            })
            sale_id = tx.fetchone()[0]

            for item in payload.items:
                db.execute(text("""
                    INSERT INTO sales_items (sale_id, product_id, quantity, unit_price)
                    VALUES (:sale_id, :product_id, :quantity, :unit_price)
                """), {
                    "sale_id": sale_id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price
                })

                # Update stock ↓
                db.execute(text("""
                    UPDATE products
                    SET stock = stock - :qty
                    WHERE product_id = :pid AND stock >= :qty
                """), {
                    "qty": item.quantity,
                    "pid": item.product_id
                })

            db.commit()
            return {"message": "Sale transaction created", "sale_id": sale_id, "transcript":payload.transcript}

        elif payload.transaction_type == "purchase":
            tx = db.execute(text("""
                INSERT INTO purchases (umkm_id, total_amount, transcript)
                VALUES (:umkm_id, :total_amount, :transcript)
                RETURNING purchase_id
            """), {
                "umkm_id": payload.umkm_id,
                "total_amount": total_amount,
                "transcript": payload.transcript
            })
            purchase_id = tx.fetchone()[0]

            for item in payload.items:
                db.execute(text("""
                    INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price)
                    VALUES (:purchase_id, :product_id, :quantity, :unit_price)
                """), {
                    "purchase_id": purchase_id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price
                })

                # Update stock ↑
                db.execute(text("""
                    UPDATE products
                    SET stock = stock + :qty
                    WHERE product_id = :pid
                """), {
                    "qty": item.quantity,
                    "pid": item.product_id
                })

            db.commit()
            return {"message": "Purchase transaction created", "purchase_id": purchase_id, "transcript": payload.transcript}
    except Exception as e:
        print(f"DB ERROR: {e}")
        raise


