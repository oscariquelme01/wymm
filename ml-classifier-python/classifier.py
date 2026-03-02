import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY'))

CATEGORIES = [
    "1. Food & Dining - Restaurants, groceries, fast food, coffee shops, food delivery"
    "2. Transportation - Gas, rideshare, airlines, public transport, car rental"
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

Reply with valid JSON only."""
        }]
    )
    
    text = response.content[0].text
    # Strip markdown code blocks if present
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)

# --- TEST DATA ---
# transactions = [
#     "COMPRA UBER * EATS PENDING, AMSTERDAM, TARJETA 5489010528177908 , COMISION 0,00",
#     "PAGO MOVIL EN SESIMBRA & COFF, COSLADA ES, TARJ. :*177908",
#     "COMPRA SIMPLEFIN BRIDGE, CHESTNUT MOUN, TARJETA 5489010528177908 , COMISION 0,04",
#     "COMPRA CC ASIATICO, SS DE LOS REY, TARJETA 5489010528177908 , COMISION 0,00",
#     "COMPRA HM ES0191, San Sebastian, TARJETA 5489010528177908 , COMISION 0,00",
#     "PAGO MOVIL EN SIR ANIMALS PLA, SAN SEBASTIAN, TARJ. :*177908",
#     "PAGO MOVIL EN MCD 428 PLAZA N, SAN SEBASTIAN, TARJ. :*177908",
#     "TRANSFERENCIA INMEDIATA DE BSV ASSOCIATION, CONCEPTO 20.01.2026",
#     "PAGO MOVIL EN SIR ANIMALS PLA, SAN SEBASTIAN, TARJ. :*177908",
#     "PAGO MOVIL EN E.S. SERVICAR C, MADRID, TARJ. :*177908",
#     "PAGO MOVIL EN 2823 TACOBELL H, RIVAS -VACIAM, TARJ. :*177908",
#     "TRANSFERENCIA INMEDIATA A FAVOR DE reuter europe GmbH CONCEPTO 8788755",
#     "RETIRADA DE EFECTIVO EN CAJERO AUTOMATICO 004944480010 EL 04/02/2026 A LAS 14:02..PAN:5489010528177908.",
#     "BIZUM A FAVOR DE SERGIO LUCAS CASTILLO CONCEPTO: Sin concepto",
#     "TRANSFERENCIA DE ALPHA GROWTH S.L., CONCEPTO ABONO NOMINA 01/2026.",
#     "PAGO MOVIL EN LA GELATERIA, COSLADA, TARJ. :*177908",
#     "BIZUM A FAVOR DE SARA EMMA MANGIAMELI CONCEPTO: Sin concepto",
#     "TRANSFERENCIA INMEDIATA A FAVOR DE Oscar Riquelme Jato CONCEPTO Transferencia",
#     "TRANSFERENCIA INMEDIATA A FAVOR DE Oscar Riquelme Jato CONCEPTO Transferencia",
#     "PAGO MOVIL EN PLANTIO MARKET, COSLADA, TARJ. :*177908",
# ]
#
# results = categorize_transactions(transactions)
#
# print(f"{'Transaction':<60} {'Category':<30} {'Confidence'}")
# print("-" * 100)
# for r in results:
#     print(f"{r['transaction'][:58]:<60} {r['category']:<30} {r['confidence']}")
