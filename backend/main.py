from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import yfinance as yf

app = FastAPI()

# ✅ CORS must be first — before any routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ All routers after middleware
from app.routes.transactions import router as transactions_router
from app.routes.screener import router as screener_router
from app.routes.payments import router as payments_router
from app.routes.market import router as market_router
from app.routes.comparison import router as comparison_router
from app.routes.alerts import router as alerts_router
from app.routes.watchlist import router as watchlist_router
from app.routes.analysis import router as analysis_router
from app.routes.news import router as news_router
from app.routes.portfolio import router as portfolio_router
from app.routes.ai import router as ai_router
from app.routes.auth import router as auth_router

app.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
app.include_router(screener_router,     prefix="/screener")
app.include_router(payments_router,     prefix="/payments")
app.include_router(market_router,       prefix="/market")
app.include_router(comparison_router,   prefix="/comparison")
app.include_router(alerts_router,       prefix="/alerts")
app.include_router(watchlist_router,    prefix="/watchlist")
app.include_router(analysis_router,     prefix="/analysis")
app.include_router(news_router,         prefix="/news")
app.include_router(portfolio_router,    prefix="/portfolio")
app.include_router(ai_router,           prefix="/ai")
app.include_router(auth_router,         prefix="/auth")

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.get("/search/{query}")
def search_stock(query: str):
    try:
        url = f"https://financialmodelingprep.com/stable/search-name?query={query}&apikey=W4rqQ4jJTwJByzC0JfJXDaQl8bXN8hBp"
        response = requests.get(url)
        data = response.json()
        if not isinstance(data, list):
            return []
        return [
            {"name": item.get("name", "Unknown"), "ticker": item.get("symbol", "")}
            for item in data if isinstance(item, dict)
        ]
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