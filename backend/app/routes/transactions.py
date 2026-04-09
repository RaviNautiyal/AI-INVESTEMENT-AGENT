from fastapi import APIRouter, HTTPException, Header
from app.database.db import transactions_collection
from app.utils.auth import decode_token
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return email

class Transaction(BaseModel):
    symbol: str
    type: str        # "buy" or "sell"
    quantity: float
    price: float
    date: str        # "YYYY-MM-DD"

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

def compute_holdings(txns: list):
    """FIFO engine — returns holdings + realized P&L from a sorted transaction list."""
    holdings = {}
    realized_pnl = 0.0

    for t in sorted(txns, key=lambda x: x["date"]):
        sym = t["symbol"]
        qty = t["quantity"]
        price = t["price"]

        if sym not in holdings:
            holdings[sym] = {"quantity": 0.0, "total_cost": 0.0}

        if t["type"] == "buy":
            holdings[sym]["quantity"] += qty
            holdings[sym]["total_cost"] += qty * price

        elif t["type"] == "sell" and holdings[sym]["quantity"] > 0:
            avg_cost = holdings[sym]["total_cost"] / holdings[sym]["quantity"]
            realized_pnl += (price - avg_cost) * qty
            holdings[sym]["quantity"] -= qty
            holdings[sym]["total_cost"] -= avg_cost * qty
            if holdings[sym]["quantity"] <= 0:
                holdings[sym] = {"quantity": 0.0, "total_cost": 0.0}

    return holdings, realized_pnl

# ── Add transaction ────────────────────────────────────────────
@router.post("/add")
def add_transaction(t: Transaction, authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    doc = {
        "email": email,
        "symbol": t.symbol.upper(),
        "type": t.type.lower(),
        "quantity": t.quantity,
        "price": t.price,
        "date": t.date,
        "created_at": datetime.utcnow().isoformat()
    }
    result = transactions_collection.insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    return doc

# ── Get all transactions + computed portfolio ──────────────────
@router.get("/")
def get_transactions(authorization: str = Header(...)):
    try:
        email = get_user_from_token(authorization)
        print("STEP 1 - email:", email)

        txns_raw = list(transactions_collection.find({"email": email}))
        print("STEP 2 - raw txns count:", len(txns_raw))

        txns = [serialize(t) for t in txns_raw]
        print("STEP 3 - serialized")

        holdings, realized_pnl = compute_holdings(txns)
        print("STEP 4 - holdings:", holdings)

        total_invested = sum(t["quantity"] * t["price"] for t in txns if t["type"] == "buy")
        print("STEP 5 - total_invested:", total_invested)

        result = {
            "transactions": txns,
            "open_positions": [],
            "summary": {
                "total_invested": round(total_invested, 2),
                "current_value": 0,
                "realized_pnl": round(realized_pnl, 2),
                "unrealized_pnl": 0,
                "total_pnl": round(realized_pnl, 2),
            }
        }
        print("STEP 6 - returning:", result)
        return result

    except Exception as e:
        print("ERROR:", e)
        import traceback
        traceback.print_exc()
        return {"transactions": [], "open_positions": [], "summary": {
            "total_invested": 0, "current_value": 0,
            "realized_pnl": 0, "unrealized_pnl": 0, "total_pnl": 0
        }}