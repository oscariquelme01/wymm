import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

CATEGORIES = [
    "Food & Dining",
    "Transportation",
    "Shopping & Retail",
    "Entertainment & Recreation",
    "Healthcare & Medical",
    "Utilities & Services",
    "Income",
    "Government & Legal",
]

def categorize_transactions(transactions: list[dict]) -> list[dict]:
    """
    Accepts a list of transaction dicts with keys: id, description, amount, type.
    Returns a list of dicts with keys: id, category, confidence, reasoning.
    """
    tx_json = json.dumps(transactions, ensure_ascii=False, indent=2)

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{
            "role": "user",
            "content": f"""Categorize these Spanish bank transactions.

Reply with ONLY a JSON array. Each element must have:
- "id": the transaction id (from the input)
- "category": one of the allowed categories listed below
- "confidence": "high", "medium", or "low"
- "reasoning": a brief sentence explaining why you chose that category

Allowed categories:
{json.dumps(CATEGORIES, indent=2)}

Transactions:
{tx_json}

Rules:
- You MUST use one of the allowed categories exactly as written. Do NOT invent new categories.
- If unsure, pick the closest match and set confidence to "low".
- Reply with valid JSON only, no markdown fencing."""
        }]
    )

    text = response.content[0].text
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)
