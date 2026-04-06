from fastapi import APIRouter, Header, HTTPException
from app.utils.auth import decode_token
from app.services.algorithms import (
    simple_moving_average,
    calculate_volatility,
    sharpe_ratio
)
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

@router.get("/compare")
def compare_stocks(
    tickers: str,
    authorization: str = Header(...)
):
    get_user_from_token(authorization)

    ticker_list = [t.strip().upper() for t in tickers.split(",")]

    if len(ticker_list) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 2 tickers"
        )

    if len(ticker_list) > 3:
        ticker_list = ticker_list[:3]

    results = []

    for symbol in ticker_list:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="3mo")

            if hist.empty:
                continue

            prices = hist["Close"].tolist()
            dates = hist.index.strftime("%Y-%m-%d").tolist()

            current_price = info.get("currentPrice") or info.get(
                "regularMarketPrice", 0
            )

            change_3mo = round(
                ((prices[-1] - prices[0]) / prices[0]) * 100, 2
            ) if prices else 0

            volatility = calculate_volatility(prices)
            sharpe = sharpe_ratio(prices)
            sma = simple_moving_average(prices, 7)

            trend = "Upward" if (
                len(sma) >= 2 and sma[-1] > sma[-2]
            ) else "Downward"

            results.append({
                "ticker": symbol,
                "name": info.get("shortName", symbol),
                "current_price": round(current_price, 2),
                "change_3mo": change_3mo,
                "volatility": volatility,
                "sharpe_ratio": sharpe,
                "trend": trend,
                "pe_ratio": round(info.get("trailingPE", 0), 2),
                "market_cap": info.get("marketCap", 0),
                "prices": [round(p, 2) for p in prices],
                "dates": dates,
                "52w_high": round(info.get("fiftyTwoWeekHigh", 0), 2),
                "52w_low": round(info.get("fiftyTwoWeekLow", 0), 2),
                "dividend_yield": round(
                    info.get("dividendYield", 0) * 100, 2
                ) if info.get("dividendYield") else 0,
            })

        except Exception:
            continue

    return results