import os
from dotenv import load_dotenv # type: ignore
from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from ml.stock_ai import AdvancedStockAI



try:
    from dotenv import load_dotenv # type: ignore
except ImportError:
    def load_dotenv(*args, **kwargs):
        return False

from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from ml.stock_ai import AdvancedStockAI

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AI = AdvancedStockAI(
    alpha_key=os.getenv("ALPHA_KEY"),
    finnhub_key=os.getenv("FINNHUB_KEY"),
    guardian_key=os.getenv("GUARDIAN_KEY"),
)

@app.get("/full-analysis/{ticker}")
def analyze_stock(ticker: str):
    return AI.full_analysis(ticker)