from fastapi import APIRouter, Header, HTTPException
from app.database.db import watchlist_collection
from app.utils.auth import decode_token
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

@router.post("/add")
def add_to_watchlist(data: dict, authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    
    existing = watchlist_collection.find_one({
        "email": email,
        "ticker": data["ticker"].upper()
    })
    
    if existing:
        return {"message": "Already in watchlist"}
    
    watchlist_collection.insert_one({
        "email": email,
        "ticker": data["ticker"].upper()
    })
    return {"message": "Added to watchlist"}

@router.delete("/remove/{ticker}")
def remove_from_watchlist(ticker: str, authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    watchlist_collection.delete_one({
        "email": email,
        "ticker": ticker.upper()
    })
    return {"message": "Removed from watchlist"}

@router.get("/all")
def get_watchlist(authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    items = list(watchlist_collection.find(
        {"email": email},
        {"_id": 0}
    ))

    enriched = []

    for item in items:
        try:
            ticker = yf.Ticker(item["ticker"])
            info = ticker.info
            hist = ticker.history(period="5d")
            prices = hist["Close"].tolist()

            current_price = info.get("currentPrice") or info.get(
                "regularMarketPrice", 0
            )

            change = round(
                ((prices[-1] - prices[-2]) / prices[-2]) * 100, 2
            ) if len(prices) >= 2 else 0

            enriched.append({
                "ticker": item["ticker"],
                "name": info.get("shortName", item["ticker"]),
                "price": round(current_price, 2),
                "change_1d": change,
                "volume": info.get("regularMarketVolume", 0),
                "market_cap": info.get("marketCap", 0),
            })

        except:
            enriched.append({
                "ticker": item["ticker"],
                "name": item["ticker"],
                "price": 0,
                "change_1d": 0,
                "volume": 0,
                "market_cap": 0,
            })

    return enriched