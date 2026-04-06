from fastapi import APIRouter, Header, HTTPException
from app.services.ai_service import get_ai_response
from app.utils.auth import decode_token
from app.database.db import portfolio_collection
from pydantic import BaseModel
import yfinance as yf

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
@router.get("/models")
def list_models():
    import google.generativeai as genai
    models = [m.name for m in genai.list_models()]
    return {"models": models}
def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

def build_portfolio_context(email: str):
    try:
        stocks = list(portfolio_collection.find({"email": email}, {"_id": 0}))
        if not stocks:
            return "User has no stocks in portfolio"

        context = "User Portfolio:\n"
        for stock in stocks:
            try:
                ticker = yf.Ticker(stock["ticker"])
                info = ticker.info
                price = info.get("currentPrice") or info.get("regularMarketPrice", 0)
                context += f"- {stock['ticker']}: Invested ₹{stock['amount']}, Current Price ${price}\n"
            except:
                context += f"- {stock['ticker']}: Invested ₹{stock['amount']}\n"

        return context
    except:
        return "Could not fetch portfolio"

from app.database.db import users_collection
from datetime import datetime

@router.post("/chat")
def chat(msg: ChatMessage, authorization: str = Header(...)):
    email = get_user_from_token(authorization)

    # Check plan and query limit
    user = users_collection.find_one({"email": email})
    plan = user.get("plan", "free") if user else "free"

    if plan == "free":
        today = datetime.utcnow().strftime("%Y-%m-%d")
        queries_date = user.get("ai_queries_date", "")
        queries_today = user.get("ai_queries_today", 0)

        if queries_date != today:
            # Reset daily count
            users_collection.update_one(
                {"email": email},
                {"$set": {
                    "ai_queries_today": 0,
                    "ai_queries_date": today
                }}
            )
            queries_today = 0

        if queries_today >= 5:
            return {
                "response": "⚠️ You have reached your daily limit of 5 AI queries. Upgrade to Pro for unlimited access.",
                "limit_reached": True
            }

        # Increment query count
        users_collection.update_one(
            {"email": email},
            {"$inc": {"ai_queries_today": 1},
             "$set": {"ai_queries_date": today}}
        )

    portfolio_context = build_portfolio_context(email)
    response = get_ai_response(msg.message, portfolio_context)
    return {"response": response, "limit_reached": False}