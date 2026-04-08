from fastapi import APIRouter, Header, HTTPException
from app.utils.auth import decode_token
from app.services.algorithms import calculate_volatility, simple_moving_average
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

STOCK_UNIVERSE = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META",
    "NFLX", "AMD", "INTC", "BABA", "TSM", "V", "JPM", "BAC",
    "WMT", "DIS", "PYPL", "UBER", "SPOT"
]

@router.get("/screen")
def screen_stocks(
    authorization: str = Header(...),
    min_price: float = 0,
    max_price: float = 99999,
    trend: str = "any",
    risk: str = "any",
    min_volume: int = 0
):
    get_user_from_token(authorization)

    results = []

    for symbol in STOCK_UNIVERSE:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="1mo")

            if hist.empty:
                continue

            prices = hist["Close"].tolist()
            volume = int(info.get("regularMarketVolume", 0))
            current_price = info.get("currentPrice") or info.get(
                "regularMarketPrice", 0
            )
            pe_ratio = info.get("trailingPE", None)
            market_cap = info.get("marketCap", 0)
            name = info.get("shortName", symbol)

            if not current_price:
                continue

            volatility = calculate_volatility(prices)
            sma = simple_moving_average(prices, 7)
            stock_trend = "Upward" if (
                len(sma) >= 2 and sma[-1] > sma[-2]
            ) else "Downward"

            risk_level = (
                "Low" if volatility < 1
                else "Medium" if volatility < 2
                else "High"
            )

            price_change = round(
                ((prices[-1] - prices[0]) / prices[0]) * 100, 2
            ) if prices else 0

            # Apply filters
            if current_price < min_price or current_price > max_price:
                continue
            if trend != "any" and stock_trend.lower() != trend.lower():
                continue
            if risk != "any" and risk_level.lower() != risk.lower():
                continue
            if volume < min_volume:
                continue

            results.append({
                "ticker": symbol,
                "name": name,
                "price": round(current_price, 2),
                "change_1mo": price_change,
                "volume": volume,
                "volatility": volatility,
                "trend": stock_trend,
                "risk": risk_level,
                "pe_ratio": round(pe_ratio, 2) if pe_ratio else None,
                "market_cap": market_cap,
            })

        except Exception:
            continue

    results.sort(key=lambda x: x["change_1mo"], reverse=True)
    return results