from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from classifier import categorize_transactions

app = FastAPI(title="Expense Categorizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    description: str
    amount: Optional[float] = None
    type: Optional[str] = None  # "EXPENSE" or "INCOME"

class ClassifyRequest(BaseModel):
    transactions: List[Transaction]

@app.post("/classify")
async def classify(request: ClassifyRequest):
    try:
        # Format as "DESCRIPTION | €AMOUNT" if amount provided
        tx_strings = [
            f"{tx.description} | {'−' if tx.type == 'EXPENSE' else '+'}€{tx.amount}"
            if tx.amount is not None else tx.description
            for tx in request.transactions
        ]
        return categorize_transactions(tx_strings)
    except Exception as e:
        return {"error": str(e)}
