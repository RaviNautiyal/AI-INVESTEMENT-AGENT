from fastapi import APIRouter, Header, HTTPException
from app.services.algorithms import (
    simple_moving_average,
    exponential_moving_average,
    SegmentTree,
    calculate_volatility,
    portfolio_optimizer,
    sharpe_ratio
)
from app.utils.auth import decode_token
from app.database.db import portfolio_collection
import yfinance as yf

router = APIRouter()

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email
@router.get("/portfolio-optimize")
def optimize_portfolio(
    authorization: str = Header(...),
    risk_tolerance: str = "medium"
):
    email = get_user_from_token(authorization)
    stocks = list(portfolio_collection.find({"email": email}, {"_id": 0}))

    if not stocks:
        return {"message": "No stocks in portfolio", "optimized_allocation": []}

    total_invested = sum(float(s["amount"]) for s in stocks)

    stock_data = []
    for stock in stocks:
        try:
            ticker = yf.Ticker(stock["ticker"])
            hist = ticker.history(period="3mo")
            prices = hist["Close"].tolist()

            if prices:
                vol = calculate_volatility(prices)
                returns = (prices[-1] - prices[0]) / prices[0] if prices[0] else 0

                stock_data.append({
                    "ticker": stock["ticker"],
                    "expected_return": round(returns, 4),
                    "risk": round(vol / 100, 4),
                    "min_investment": 1000
                })
        except:
            continue

    optimized = portfolio_optimizer(stock_data, total_invested, risk_tolerance)

    return {
        "total_budget": total_invested,
        "optimized_allocation": optimized,
        "algorithm": "Greedy Knapsack with Risk Tolerance"
    }
@router.get("/stock/{ticker}")
def analyze_stock(ticker: str, authorization: str = Header(...)):
    get_user_from_token(authorization)

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="3mo")
        prices = hist["Close"].tolist()
        dates = hist.index.strftime("%Y-%m-%d").tolist()

        if not prices:
            raise HTTPException(status_code=404, detail="No data found")

        sma = simple_moving_average(prices, 7)
        ema = exponential_moving_average(prices, 7)
        volatility = calculate_volatility(prices)
        sharpe = sharpe_ratio(prices)

        # Segment tree for range queries
        seg_tree = SegmentTree(prices)
        max_price_last_30 = seg_tree.get_max_in_range(
            max(0, len(prices) - 30),
            len(prices) - 1
        )

        # Trend detection
        if len(sma) >= 2:
            trend = "Upward" if sma[-1] > sma[-2] else "Downward"
        else:
            trend = "Neutral"

        return {
            "ticker": ticker,
            "prices": [round(p, 2) for p in prices],
            "dates": dates,
            "sma_7": sma,
            "ema_7": ema,
            "volatility": volatility,
            "sharpe_ratio": sharpe,
            "max_price_last_30_days": round(max_price_last_30, 2),
            "trend": trend,
            "total_data_points": len(prices)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/portfolio-optimize")
def optimize_portfolio(authorization: str = Header(...)):
    email = get_user_from_token(authorization)

    stocks = list(portfolio_collection.find({"email": email}, {"_id": 0}))

    if not stocks:
        return {"message": "No stocks in portfolio"}

    total_invested = sum(float(s["amount"]) for s in stocks)

    stock_data = []
    for stock in stocks:
        try:
            ticker = yf.Ticker(stock["ticker"])
            hist = ticker.history(period="3mo")
            prices = hist["Close"].tolist()

            if prices:
                vol = calculate_volatility(prices)
                returns = (prices[-1] - prices[0]) / prices[0] if prices[0] else 0

                stock_data.append({
                    "ticker": stock["ticker"],
                    "expected_return": round(returns, 4),
                    "risk": round(vol / 100, 4),
                    "min_investment": 1000
                })
        except:
            continue

    optimized = portfolio_optimizer(stock_data, total_invested)

    return {
        "total_budget": total_invested,
        "optimized_allocation": optimized,
        "algorithm": "Greedy Knapsack with Risk Tolerance"
    }
@router.get("/candles/{ticker}")
def get_candles(ticker: str, period: str = "3mo", authorization: str = Header(...)):
    get_user_from_token(authorization)

    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)

        if hist.empty:
            raise HTTPException(status_code=404, detail="No data found")

        prices = hist["Close"].tolist()

        # Candlestick data
        candles = []
        for index, row in hist.iterrows():
            candles.append({
                "time": index.strftime("%Y-%m-%d"),
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
            })

        # Volume data
        volumes = []
        for index, row in hist.iterrows():
            volumes.append({
                "time": index.strftime("%Y-%m-%d"),
                "value": int(row["Volume"]),
                "color": "#26a69a" if row["Close"] >= row["Open"] else "#ef5350"
            })

        # RSI Calculation
        def calculate_rsi(prices, period=14):
            if len(prices) < period + 1:
                return []
            gains, losses = [], []
            for i in range(1, len(prices)):
                diff = prices[i] - prices[i-1]
                gains.append(max(diff, 0))
                losses.append(max(-diff, 0))
            avg_gain = sum(gains[:period]) / period
            avg_loss = sum(losses[:period]) / period
            rsi_values = []
            for i in range(period, len(prices)):
                if avg_loss == 0:
                    rsi_values.append(100)
                else:
                    rs = avg_gain / avg_loss
                    rsi_values.append(round(100 - (100 / (1 + rs)), 2))
                diff = prices[i] - prices[i-1]
                gain = max(diff, 0)
                loss = max(-diff, 0)
                avg_gain = (avg_gain * (period-1) + gain) / period
                avg_loss = (avg_loss * (period-1) + loss) / period
            return rsi_values

        # MACD Calculation
        def calculate_macd(prices, fast=12, slow=26, signal=9):
            def ema(data, period):
                k = 2 / (period + 1)
                ema_values = [data[0]]
                for price in data[1:]:
                    ema_values.append(price * k + ema_values[-1] * (1 - k))
                return ema_values

            if len(prices) < slow:
                return [], [], []

            fast_ema = ema(prices, fast)
            slow_ema = ema(prices, slow)
            macd_line = [round(f - s, 4) for f, s in zip(fast_ema, slow_ema)]
            signal_line = ema(macd_line, signal)
            histogram = [round(m - s, 4) for m, s in zip(macd_line, signal_line)]

            return macd_line, signal_line, histogram

        dates = [c["time"] for c in candles]
        rsi = calculate_rsi(prices)
        macd_line, signal_line, histogram = calculate_macd(prices)

        # Align RSI with dates
        rsi_data = []
        rsi_offset = len(dates) - len(rsi)
        for i, val in enumerate(rsi):
            rsi_data.append({
                "time": dates[i + rsi_offset],
                "value": val
            })

        # Align MACD with dates
        macd_data = []
        macd_offset = len(dates) - len(macd_line)
        for i, val in enumerate(macd_line):
            macd_data.append({
                "time": dates[i + macd_offset],
                "macd": val,
                "signal": round(signal_line[i], 4),
                "histogram": round(histogram[i], 4)
            })

        return {
            "ticker": ticker,
            "candles": candles,
            "volumes": volumes,
            "rsi": rsi_data,
            "macd": macd_data,
            "current_price": round(prices[-1], 2),
            "period": period
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))