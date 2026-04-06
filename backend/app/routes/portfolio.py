from fastapi import APIRouter, HTTPException, Header
from app.database.db import portfolio_collection
from app.utils.auth import decode_token
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return email

def get_usd_to_inr():
    try:
        ticker = yf.Ticker("USDINR=X")
        data = ticker.history(period="1d")
        if not data.empty:
            return float(data["Close"].iloc[-1])
        return 83.5
    except:
        return 83.5

@router.post("/add")
def add_stock(data: dict, authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    data["email"] = email
    portfolio_collection.insert_one(data)
    return {"message": "Stock added successfully"}

@router.delete("/remove/{ticker}")
def remove_stock(ticker: str, authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    portfolio_collection.delete_one({"ticker": ticker, "email": email})
    return {"message": "Stock removed"}

@router.delete("/clear")
def clear_portfolio(authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    portfolio_collection.delete_many({"email": email})
    return {"message": "Portfolio cleared"}

@router.get("/all")
def get_portfolio(authorization: str = Header(...)):
    email = get_user_from_token(authorization)
    stocks = list(portfolio_collection.find({"email": email}, {"_id": 0}))

    usd_to_inr = get_usd_to_inr()
    enriched = []

    for stock in stocks:
        try:
            ticker = yf.Ticker(stock["ticker"])
            info = ticker.info

            current_price_usd = info.get("currentPrice") or info.get("regularMarketPrice", 0)
            current_price_inr = current_price_usd * usd_to_inr

            invested = float(stock["amount"])
            shares = invested / current_price_inr if current_price_inr else 0
            current_value = shares * current_price_inr
            profit_loss = current_value - invested
            percent_change = (profit_loss / invested) * 100 if invested else 0

            enriched.append({
                "ticker": stock["ticker"],
                "invested": round(invested, 2),
                "current_price_usd": round(current_price_usd, 2),
                "current_price_inr": round(current_price_inr, 2),
                "shares": round(shares, 4),
                "current_value": round(current_value, 2),
                "profit_loss": round(profit_loss, 2),
                "percent_change": round(percent_change, 2),
                "usd_to_inr": round(usd_to_inr, 2)
            })

        except:
            enriched.append({
                "ticker": stock["ticker"],
                "invested": float(stock["amount"]),
                "current_price_usd": 0,
                "current_price_inr": 0,
                "shares": 0,
                "current_value": 0,
                "profit_loss": 0,
                "percent_change": 0,
                "usd_to_inr": usd_to_inr
            })

    return enriched