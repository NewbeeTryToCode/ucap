from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from db.db import get_db
from schemas.schemas import TransactionRequest, MonthlyTransaction
from datetime import datetime
from collections import defaultdict

router = APIRouter()

@router.get("/monthly_transaction")
async def get_monthly_transaction(
    umkm_id: str = Query(..., description="ID UMKM"),
    db: Session = Depends(get_db)):
    """
    API to get monthly transaction based on the umkm id
    """
    print(umkm_id)
    now = datetime.utcnow()
    year = now.year
    month = now.month
    try:
        result = db.execute(
            text("""
                SELECT CAST(sale_date AS DATE) AS day,
                       SUM(total_amount) AS total_amount
                FROM sales
                WHERE umkm_id = :umkm_id
                AND EXTRACT(YEAR FROM sale_date) = :year
                AND EXTRACT(MONTH FROM sale_date) = :month
                GROUP BY day
                ORDER BY day DESC
            """),
            {
                "umkm_id": umkm_id,
                "year": year,
                "month": month
            }
        ).fetchall()
    except Exception as e:
        print(f"DB ERROR: {e}")
        raise
    
    
    rows = [{"date": str(r[0]), "total_amount": float(r[1])} for r in result]
    
    return {
        "umkm_id": umkm_id,
        "data": rows
    }

@router.get("/transaction_summary")
async def get_dashboard_summary(
    umkm_id: str = Query(..., description="ID UMKM"),
    db: Session = Depends(get_db)):
    """
    Endopoint to get daily and monthly transaction summary
    """

    now = datetime.utcnow()
    current_date = now.date()
    current_year = now.year
    current_month = now.month

    try:
        # Query 1: total penjualan & jumlah transaksi hari ini
        daily_result = db.execute(
            text("""
                SELECT 
                    COALESCE(SUM(total_amount), 0) AS total_sales,
                    COUNT(*) AS total_transactions
                FROM sales
                WHERE umkm_id = :umkm_id
                AND CAST(sale_date AS DATE) = :current_date
            """),
            {
                "umkm_id": umkm_id,
                "current_date": current_date
            }
        ).fetchone()

        # Query 2: total penjualan & jumlah transaksi bulan ini
        monthly_result = db.execute(
            text("""
                SELECT 
                    COALESCE(SUM(total_amount), 0) AS total_sales,
                    COUNT(*) AS total_transactions
                FROM sales
                WHERE umkm_id = :umkm_id
                AND EXTRACT(YEAR FROM sale_date) = :year
                AND EXTRACT(MONTH FROM sale_date) = :month
            """),
            {
                "umkm_id": umkm_id,
                "year": current_year,
                "month": current_month
            }
        ).fetchone()

    except Exception as e:
        print(f"DB ERROR: {e}")
        raise

    return {
        "umkm_id": umkm_id,
        "daily": {
            "total_sales": float(daily_result.total_sales),
            "total_transactions": daily_result.total_transactions,
        },
        "monthly": {
            "total_sales": float(monthly_result.total_sales),
            "total_transactions": monthly_result.total_transactions,
        }
    }

@router.get("/last_transaction")
async def get_last_transaction(
    umkm_id: str = Query(..., description="ID UMKM"),
    db: Session = Depends(get_db)):
    """
    API to get top 5 transaction based on the umkm id
    """
    try:
        result = db.execute(
            text("""
                SELECT 
                    s.sale_id, s.sale_date, s.status, s.total_amount,
                    p.product_id, p.name as product_name, p.category,
                    si.quantity, si.unit_price
                FROM sales s
                LEFT JOIN sales_items si ON s.sale_id = si.sale_id
                LEFT JOIN products p ON si.product_id = p.product_id
                WHERE s.umkm_id = :umkm_id
                ORDER BY s.sale_date DESC, s.sale_id DESC

                LIMIT 5
            """),
            {"umkm_id": umkm_id}
        ).mappings().all()
        print(result)
        # Organize data per sale_id

        transactions = defaultdict(lambda: {
            "sale_id": None,
            "sale_date": None,
            "status": None,
            "total_amount": None,
            "items": []
        })
        
        for row in result:
            sale_id = row["sale_id"]
            if transactions[sale_id]["sale_id"] is None:
                transactions[sale_id].update({
                    "sale_id": sale_id,
                    "sale_date": row["sale_date"],
                    "status": row["status"],
                    "total_amount": float(row["total_amount"]),
                    "items": []
                })

            if row["product_id"] is not None:
                transactions[sale_id]["items"].append({
                    "product_id": row["product_id"],
                    "name": row["product_name"],
                    "quantity": row["quantity"],
                    "unit_price": float(row["unit_price"])
                })
        
        print(f"Transactions: {list(transactions.values())}")

        return list(transactions.values())

    except Exception as e:
        return {"error": str(e)}
