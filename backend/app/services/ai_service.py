import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def get_ai_response(user_message: str, portfolio_context: str = ""):
    try:
        system_prompt = f"""
You are an expert AI financial advisor assistant.
You help users with stock market analysis, investment advice, and portfolio management.
Always give practical, clear, and helpful financial insights.
If the user shares their portfolio, analyze it and give specific advice.

User Portfolio Context:
{portfolio_context if portfolio_context else "No portfolio data provided"}

Important: Always mention that your advice is for educational purposes only
and not professional financial advice.
"""

        full_prompt = f"{system_prompt}\n\nUser Question: {user_message}"
        response = model.generate_content(full_prompt)
        return response.text

    except Exception as e:
        return f"AI service error: {str(e)}"