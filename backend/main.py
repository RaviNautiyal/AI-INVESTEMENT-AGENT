from fastapi import FastAPI
import yfinance as yf

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.get("/stock/{ticker}")
def get_stock(ticker: str):
    stock = yf.Ticker(ticker)
    data = stock.history(period="1mo")

    return {
        "ticker": ticker,
        "close_prices": data["Close"].tolist(),
        "dates": data.index.strftime("%Y-%m-%d").tolist()
    }