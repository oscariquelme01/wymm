import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

CATEGORIES = [
    "1. Food & Dining - Restaurants, groceries, fast food, coffee shops, food delivery",
    "2. Transportation - Gas, rideshare, airlines, public transport, car rental",
    "3. Shopping & Retail - Online shopping, electronics, retail, fashion, home & garden",
    "4. Entertainment & Recreation - Streaming, gaming, movies, music, sports",
    "5. Healthcare & Medical - Medical, pharmacy, dental, vision, fitness",
    "6. Utilities & Services - Electricity, water, gas, internet & phone, cable",
    "7. Income - Salary, freelance, business, investments, government benefits",
    "8. Government & Legal - Taxes, licenses, legal services, government fees",
]

def categorize_transactions(transactions: list[str]) -> list[dict]:
    tx_list = "\n".join(f"{i+1}. {tx}" for i, tx in enumerate(transactions))
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": f"""Categorize these Spanish bank transactions. 
Reply with ONLY a JSON array with fields "transaction", "category", and "confidence" (high/medium/low).

Categories:
{chr(10).join(CATEGORIES)}

Transactions:
{tx_list}

Reply with valid JSON only. DO NOT create any new categories or least some as unknown, if you are not sure, include confidence as low and that's fine."""
        }]
    )
    
    text = response.content[0].text
    # Strip markdown code blocks if present
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)
