import os
import json
import re
import base64
from groq import Groq

MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"
_client = None

def init_gemini():
    global _client
    _client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def _call_vision(prompt: str, image_bytes: bytes) -> str:
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    response = _client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    {"type": "text", "text": prompt},
                ],
            }
        ],
        max_tokens=1024,
    )
    return response.choices[0].message.content

def _parse_json(text: str) -> list:
    text = re.sub(r"```json|```", "", text).strip()
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        text = match.group(0)
    try:
        return json.loads(text)
    except Exception:
        return []

def scan_receipt(image_bytes: bytes) -> list[dict]:
    prompt = """Analiza este ticket de compra de supermercado.
Extrae todos los productos alimenticios con su precio.
Responde SOLO con un JSON válido, sin texto adicional, con este formato exacto:
[{"name": "Leche Gloria", "price": 4.50, "quantity": "1L"}, ...]
Si no puedes leer el ticket, responde: []"""
    text = _call_vision(prompt, image_bytes)
    return _parse_json(text)

def scan_fridge(image_bytes: bytes) -> list[dict]:
    prompt = """Analiza esta foto del interior de un refrigerador o de alimentos.
Identifica todos los alimentos que puedas ver.
Responde SOLO con un JSON válido, sin texto adicional, con este formato exacto:
[{"name": "Tomates", "quantity": "3 unidades", "category": "verduras"}, ...]
Categorías posibles: frutas, verduras, lácteos, carnes, bebidas, otros
Si no puedes identificar nada, responde: []"""
    text = _call_vision(prompt, image_bytes)
    return _parse_json(text)
