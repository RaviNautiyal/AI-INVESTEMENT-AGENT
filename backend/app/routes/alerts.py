from fastapi import APIRouter, Header, HTTPException
from app.database.db import alerts_collection
from app.utils.auth import decode_token
from pydantic import BaseModel
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

class AlertSchema(BaseModel):
    ticker: str
    target_price: float
    condition: str  # "above" or "below"

@router.post("/add")
def add_alert(data: AlertSchema, authorization: str = Header(...)):
    email = get_user_from_token(authorization)

    alerts_collection.insert_one({
        "email": email,
        "ticker": data.ticker.upper(),
        "target_price": data.target_price,
        "condition": data.condition,
        "triggered": False
    })

    return {"message": "Alert created successfully"}

@router.get("/all")
def get_alerts(authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    alerts = list(alerts_collection.find(
        {"email": email},
        {"_id": 0}
    ))
    return alerts

@router.delete("/remove/{ticker}")
def remove_alert(ticker: str, authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    alerts_collection.delete_one({
        "email": email,
        "ticker": ticker.upper()
    })
    return {"message": "Alert removed"}

@router.get("/check")
def check_alerts(authorization: str = Header(...)):
    email = get_user_from_token(authorization)

    alerts = list(alerts_collection.find({
        "email": email,
        "triggered": False
    }))

    triggered = []

    for alert in alerts:
        try:
            ticker = yf.Ticker(alert["ticker"])
            info = ticker.info
            current_price = info.get("currentPrice") or info.get(
                "regularMarketPrice", 0
            )

            is_triggered = False

            if alert["condition"] == "above" and current_price >= alert["target_price"]:
                is_triggered = True
            elif alert["condition"] == "below" and current_price <= alert["target_price"]:
                is_triggered = True

            if is_triggered:
                alerts_collection.update_one(
                    {"email": email, "ticker": alert["ticker"]},
                    {"$set": {"triggered": True, "triggered_at": current_price}}
                )
                triggered.append({
                    "ticker": alert["ticker"],
                    "condition": alert["condition"],
                    "target_price": alert["target_price"],
                    "current_price": round(current_price, 2)
                })

        except:
            continue

    return {
        "triggered_alerts": triggered,
        "total_checked": len(alerts)
    }