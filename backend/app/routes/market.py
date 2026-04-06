from fastapi import APIRouter, Header, HTTPException
from app.utils.auth import decode_token
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

# Major indices
INDICES = [
    {"ticker": "^GSPC", "name": "S&P 500"},
    {"ticker": "^IXIC", "name": "NASDAQ"},
    {"ticker": "^DJI", "name": "Dow Jones"},
    {"ticker": "^NSEI", "name": "Nifty 50"},
    {"ticker": "^BSESN", "name": "Sensex"},
    {"ticker": "^FTSE", "name": "FTSE 100"},
]

# Stocks to track for gainers/losers
UNIVERSE = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META",
    "NFLX", "AMD", "INTC", "V", "JPM", "BAC", "WMT", "DIS",
    "PYPL", "UBER", "SPOT", "BABA", "TSM"
]

@router.get("/indices")
def get_indices(authorization: str = Header(...)):
    get_user_from_token(authorization)

    results = []

    for index in INDICES:
        try:
            ticker = yf.Ticker(index["ticker"])
            hist = ticker.history(period="2d")

            if hist.empty or len(hist) < 2:
                continue

            prices = hist["Close"].tolist()
            current = round(prices[-1], 2)
            prev = round(prices[-2], 2)
            change = round(((current - prev) / prev) * 100, 2)

            results.append({
                "ticker": index["ticker"],
                "name": index["name"],
                "price": current,
                "change": change,
            })

        except Exception:
            continue

    return results

@router.get("/movers")
def get_movers(authorization: str = Header(...)):
    get_user_from_token(authorization)

    stocks = []

    for symbol in UNIVERSE:
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="2d")
            info = ticker.info

            if hist.empty or len(hist) < 2:
                continue

            prices = hist["Close"].tolist()
            current = round(prices[-1], 2)
            prev = round(prices[-2], 2)
            change = round(((current - prev) / prev) * 100, 2)

            stocks.append({
                "ticker": symbol,
                "name": info.get("shortName", symbol),
                "price": current,
                "change": change,
            })

        except Exception:
            continue

    stocks.sort(key=lambda x: x["change"], reverse=True)

    return {
        "gainers": stocks[:5],
        "losers": stocks[-5:][::-1]
    }

@router.get("/summary")
def get_market_summary(authorization: str = Header(...)):
    get_user_from_token(authorization)

    try:
        # Fear & Greed proxy using VIX
        vix = yf.Ticker("^VIX")
        vix_hist = vix.history(period="2d")
        vix_value = round(vix_hist["Close"].tolist()[-1], 2)

        if vix_value < 15:
            sentiment = "Extreme Greed"
            sentiment_color = "green"
        elif vix_value < 20:
            sentiment = "Greed"
            sentiment_color = "green"
        elif vix_value < 25:
            sentiment = "Neutral"
            sentiment_color = "yellow"
        elif vix_value < 30:
            sentiment = "Fear"
            sentiment_color = "red"
        else:
            sentiment = "Extreme Fear"
            sentiment_color = "red"

        # Gold and Oil prices
        gold = yf.Ticker("GC=F")
        gold_hist = gold.history(period="2d")
        gold_price = round(gold_hist["Close"].tolist()[-1], 2)

        oil = yf.Ticker("CL=F")
        oil_hist = oil.history(period="2d")
        oil_price = round(oil_hist["Close"].tolist()[-1], 2)

        # USD/INR
        usdinr = yf.Ticker("USDINR=X")
        usdinr_hist = usdinr.history(period="2d")
        usdinr_price = round(usdinr_hist["Close"].tolist()[-1], 2)

        return {
            "vix": vix_value,
            "sentiment": sentiment,
            "sentiment_color": sentiment_color,
            "gold": gold_price,
            "oil": oil_price,
            "usdinr": usdinr_price,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))