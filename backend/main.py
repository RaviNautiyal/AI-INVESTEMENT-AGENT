from fastapi import FastAPI
import requests
import yfinance as yf
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
from app.routes.payments import router as payments_router

app.include_router(payments_router, prefix="/payments")
from app.routes.market import router as market_router

app.include_router(market_router, prefix="/market")
from app.routes.comparison import router as comparison_router

app.include_router(comparison_router, prefix="/comparison")
from app.routes.alerts import router as alerts_router

app.include_router(alerts_router, prefix="/alerts")
from app.routes.watchlist import router as watchlist_router

app.include_router(watchlist_router, prefix="/watchlist")
from app.routes.analysis import router as analysis_router

app.include_router(analysis_router, prefix="/analysis")
from app.routes.news import router as news_router

app.include_router(news_router, prefix="/news")
from app.routes.portfolio import router as portfolio_router

app.include_router(portfolio_router, prefix="/portfolio")
from app.routes.ai import router as ai_router

app.include_router(ai_router, prefix="/ai")
from app.routes.auth import router as auth_router

app.include_router(auth_router, prefix="/auth")
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "Backend is running"}



@app.get("/search/{query}")
def search_stock(query: str):
    try:
        url = f"https://financialmodelingprep.com/stable/search-name?query={query}&apikey=W4rqQ4jJTwJByzC0JfJXDaQl8bXN8hBp"
        response = requests.get(url)
        data = response.json()

        # 🔥 IMPORTANT FIX
        if not isinstance(data, list):
            return []

        results = []

        for item in data:
            if isinstance(item, dict):
                results.append({
                    "name": item.get("name", "Unknown"),
                    "ticker": item.get("symbol", "")
                })

        return results

    except Exception as e:
        return {"error": str(e)}
@app.get("/stock/{ticker}")
def get_stock(ticker: str):
    stock = yf.Ticker(ticker)
    data = stock.history(period="1mo")

    return {
        "ticker": ticker,
        "close_prices": data["Close"].tolist(),
        "dates": data.index.strftime("%Y-%m-%d").tolist()
    }