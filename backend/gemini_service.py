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

MIN_NAME_LEN = 2
JUNK_KEYWORDS = [
    "boutique", "tarjeta", "card", "razon social", "ruc", "rfc", "tel.", "telefono",
    "direccion", "av.", "calle", "col.", "cuernavaca", "moda", "huella", "www.", ".com",
]

def _is_valid_food_item(name: str) -> bool:
    if not name or len(name.strip()) < MIN_NAME_LEN:
        return False
    lower = name.lower()
    if any(j in lower for j in JUNK_KEYWORDS):
        return False
    if not re.search(r"[a-zA-Záéíóúñ]", name):
        return False
    return True

def scan_receipt(image_bytes: bytes) -> list[dict]:
    prompt = """Analiza esta imagen. Puede ser un ticket de compra de supermercado o una foto de alimentos/refrigerador.

REGLAS ESTRICTAS:
1. SOLO incluye productos alimenticios o de despensa (comida, bebidas, lácteos, frutas, verduras, carnes, etc).
2. Si la imagen NO es un ticket de compra ni contiene alimentos reconocibles (por ejemplo: una tarjeta de presentación, un documento, un objeto no comestible, texto ilegible), responde exactamente: []
3. Si no estás seguro de qué es un producto o su nombre es ambiguo, OMÍTELO. Es preferible omitir un producto dudoso que inventar uno incorrecto.
4. NO inventes productos que no estén claramente visibles en la imagen.
5. Ignora nombres de tiendas, direcciones, totales, impuestos, números de teléfono, RUC/RFC y cualquier texto que no sea un producto alimenticio.

Responde SOLO con un JSON válido, sin texto adicional, con este formato exacto:
[{"name": "Leche Gloria", "price": 4.50, "quantity": "1L"}, ...]
Si no hay productos alimenticios claros, responde: []"""
    text = _call_vision(prompt, image_bytes)
    items = _parse_json(text)
    return [it for it in items if _is_valid_food_item(it.get("name", ""))]

def scan_fridge(image_bytes: bytes) -> list[dict]:
    prompt = """Analiza esta foto del interior de un refrigerador o de alimentos.

REGLAS ESTRICTAS:
1. SOLO identifica alimentos claramente visibles y reconocibles.
2. Si un objeto no es claramente un alimento, o no puedes identificarlo con certeza, OMÍTELO.
3. NO inventes alimentos que no estén en la imagen.

Responde SOLO con un JSON válido, sin texto adicional, con este formato exacto:
[{"name": "Tomates", "quantity": "3 unidades", "category": "verduras"}, ...]
Categorías posibles: frutas, verduras, lácteos, carnes, bebidas, otros
Si no puedes identificar nada con certeza, responde: []"""
    text = _call_vision(prompt, image_bytes)
    items = _parse_json(text)
    return [it for it in items if _is_valid_food_item(it.get("name", ""))]
