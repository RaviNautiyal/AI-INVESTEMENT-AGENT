from fastapi import APIRouter, Header, HTTPException
from app.services.news_service import get_stock_news
from app.services.ai_service import get_ai_response
from app.utils.auth import decode_token
from pydantic import BaseModel

router = APIRouter()

class NewsAnalysisRequest(BaseModel):
    ticker: str
    company_name: str = ""

def get_user_from_token(authorization: str):
    token = authorization.replace("Bearer ", "")
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

@router.post("/fetch")
def fetch_news(req: NewsAnalysisRequest, authorization: str = Header(...)):
    get_user_from_token(authorization)
    articles = get_stock_news(req.ticker, req.company_name)
    return {"articles": articles}

@router.post("/analyze")
def analyze_news(req: NewsAnalysisRequest, authorization: str = Header(...)):
    get_user_from_token(authorization)
    
    articles = get_stock_news(req.ticker, req.company_name)

    if not articles:
        return {"analysis": "No recent news found for this stock."}

    # Build news context for AI
    news_context = f"Recent news about {req.ticker}:\n\n"
    for i, article in enumerate(articles):
        news_context += f"{i+1}. {article['title']}\n"
        if article['description']:
            news_context += f"   {article['description']}\n"
        news_context += f"   Source: {article['source']}\n\n"

    prompt = f"""
Based on these recent news articles about {req.ticker}, provide:
1. A brief summary of what is happening with this stock
2. Whether the news sentiment is positive, negative, or neutral
3. How this news might impact the stock price
4. A simple investment recommendation based on this news

{news_context}
"""

    analysis = get_ai_response(prompt)
    return {
        "articles": articles,
        "analysis": analysis
    }