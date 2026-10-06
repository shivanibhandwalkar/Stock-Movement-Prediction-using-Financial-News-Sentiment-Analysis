# StockSphere: Stock Movement Prediction using Financial News Sentiment

Final year project, D.Y. Patil University, Pune (2025-26).

## What it does
The system reads financial news, measures whether the sentiment is positive, negative or neutral, and combines that with price history to estimate where a stock may go next. For a ticker like AAPL it returns:
- a BUY / HOLD / SELL signal
- a news sentiment score (FinBERT)
- a predicted price and expected return (LSTM)
- a risk level, volatility and Value at Risk
- a 30-day price range from Monte Carlo simulation

## How it works
News (Guardian, Finnhub) -> text cleaning -> FinBERT sentiment -> combined with prices (Alpha Vantage / yfinance) -> LSTM forecast + Monte Carlo risk -> signal -> dashboard

## Tech stack
- **Backend:** Python 3.12, FastAPI, PyTorch, Transformers (FinBERT), TensorFlow (LSTM), yfinance
- **Frontend:** Next.js 15, React, Tailwind CSS, Framer Motion, Recharts
- **Database:** MySQL with Prisma (login and registration)

## Project structure
```
backend/    FastAPI app and ML code (ml/)
frontend/   Next.js app (dashboard, login, API routes)
```

## Setup

### 1. Keys (all free)
Copy the example files and fill in your own keys:
- `backend/.env.example` -> `backend/.env`
- `frontend/.env.example` -> `frontend/.env`

Keys come from: Guardian Open Platform, Finnhub, Alpha Vantage.

### 2. Backend
```
cd backend
py -3.12 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
The first run downloads the FinBERT model (about 440 MB) and is slow.

### 3. Database
Start MySQL, create a database named `stockdb`, then:
```
cd frontend
npm install
npx prisma generate
npx prisma migrate deploy
```

### 4. Frontend
```
cd frontend
npm run dev
```
Open http://localhost:3000 and go to /stocks. The AI Stock Prediction panel calls the backend.

## Notes
- The landing page ticker, Market Watch cards, sector radar and "Global Market Pulse" are demo data. The **AI Stock Prediction** panel uses the real models.
- Free API plans have small daily limits, so test one ticker at a time.
- This is an academic project, not financial advice.

## Team
- Swapnil Ramesh Parthare
- Jatin Pravin Bagul
- Rutvik Balu Shinde
- Shivani Bhandwalkar

Guide: Prof. Pradeep Shinde, Department of Computer Engineering
