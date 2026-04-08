from fastapi import APIRouter, Depends, HTTPException
from app.database.db import transactions_collection
from app.utils.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
import yfinance as yf

router = APIRouter()

class Transaction(BaseModel):
    symbol: str
    type: str        # "buy" or "sell"
    quantity: float
    price: float
    date: str        # ISO string e.g. "2024-01-15"

def serialize(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# ── Add a transaction ──────────────────────────────────────────
@router.post("/add")
async def add_transaction(t: Transaction, user=Depends(get_current_user)):
    doc = {
        "user_id": user["user_id"],
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

# ── Get all transactions + P&L summary ────────────────────────
@router.get("/")
async def get_transactions(user=Depends(get_current_user)):
    user_id = user["user_id"]
    txns = [serialize(t) for t in transactions_collection.find({"user_id": user_id})]

    # Group by symbol to compute P&L
    holdings = {}  # symbol -> {quantity, avg_cost}
    realized_pnl = 0.0

    # Sort by date so FIFO works correctly
    txns_sorted = sorted(txns, key=lambda x: x["date"])

    for t in txns_sorted:
        sym = t["symbol"]
        qty = t["quantity"]
        price = t["price"]

        if sym not in holdings:
            holdings[sym] = {"quantity": 0, "total_cost": 0.0}

        if t["type"] == "buy":
            holdings[sym]["quantity"] += qty
            holdings[sym]["total_cost"] += qty * price

        elif t["type"] == "sell":
            if holdings[sym]["quantity"] > 0:
                avg_cost = holdings[sym]["total_cost"] / holdings[sym]["quantity"]
                realized_pnl += (price - avg_cost) * qty
                holdings[sym]["quantity"] -= qty
                holdings[sym]["total_cost"] -= avg_cost * qty
                if holdings[sym]["quantity"] <= 0:
                    holdings[sym] = {"quantity": 0, "total_cost": 0.0}

    # Fetch live prices for open positions
    unrealized_pnl = 0.0
    current_value = 0.0
    open_positions = []

    for sym, data in holdings.items():
        if data["quantity"] <= 0:
            continue
        try:
            ticker = yf.Ticker(sym)
            live_price = ticker.fast_info["last_price"]
        except:
            live_price = None

        avg_cost = data["total_cost"] / data["quantity"] if data["quantity"] > 0 else 0
        pos_value = (live_price or avg_cost) * data["quantity"]
        pos_pnl = ((live_price or avg_cost) - avg_cost) * data["quantity"]

        unrealized_pnl += pos_pnl
        current_value += pos_value

        open_positions.append({
            "symbol": sym,
            "quantity": data["quantity"],
            "avg_cost": round(avg_cost, 2),
            "live_price": round(live_price, 2) if live_price else None,
            "current_value": round(pos_value, 2),
            "unrealized_pnl": round(pos_pnl, 2),
            "pnl_pct": round(((live_price or avg_cost) - avg_cost) / avg_cost * 100, 2) if avg_cost else 0
        })

    total_invested = sum(
        t["quantity"] * t["price"] for t in txns if t["type"] == "buy"
    )

    return {
        "transactions": txns_sorted,
        "open_positions": open_positions,
        "summary": {
            "total_invested": round(total_invested, 2),
            "current_value": round(current_value, 2),
            "realized_pnl": round(realized_pnl, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
            "total_pnl": round(realized_pnl + unrealized_pnl, 2),
        }
    }

# ── Delete a transaction ───────────────────────────────────────
@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str, user=Depends(get_current_user)):
    result = transactions_collection.delete_one({
        "_id": ObjectId(transaction_id),
        "user_id": user["user_id"]
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Deleted successfully"}