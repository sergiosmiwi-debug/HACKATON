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
    # productos de limpieza/higiene: no son comida ni despensa, no se guardan en la alacena
    "detergente", "lejía", "lejia", "cloro", "suavizante", "jabón", "jabon", "shampoo",
    "champú", "champu", "desinfectante", "insecticida", "papel higiénico", "papel higienico",
    "pañal", "panal", "toalla higiénica", "toalla higienica", "limpiador", "lavavajilla",
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

PERU_SPANISH_NOTE = """
IMPORTANTE - usa nombres en español peruano, no en italiano, inglés ni de otros países:
- "elote" → "choclo"
- "aguacate" → "palta"
- "batata" / "boniato" → "camote"
- "frijoles" / "porotos" → "frejoles"
- "basilico" / "basil" / "albahaca italiana" → "albahaca"
- "banano" / "banana" → "plátano"
- "cilantro" / "coriander" → "culantro"
- "zucchini" / "zuchinni" / "zucchetti" → "zapallito italiano" o "calabacín"
- "spinach" → "espinaca"
- "broccoli" → "brócoli"
- "blueberry" → "arándano"
- "strawberry" → "fresa"
- "pineapple" → "piña"
- "avocado" → "palta"
- "corn" → "choclo"
- "potato" → "papa"
- "onion" → "cebolla"
- "garlic" → "ajo"
- "ginger" → "jengibre"
- "tomato" → "tomate"
- "chicken" → "pollo"
- "beef" / "meat" → "carne"
- "fish" → "pescado"
- "milk" → "leche"
- "butter" → "mantequilla"
- "cheese" → "queso"
- "egg" / "eggs" → "huevos"
Nunca uses nombres en italiano, inglés, francés ni portugués. Siempre en español peruano.
"""

MATERIAL_NOTE = """
Para cada producto, identifica el MATERIAL PREDOMINANTE del empaque/envase (el que define cómo se desecha) y ponlo en el campo "material".
Usa EXACTAMENTE uno de estos valores:
- "plastico"   (botellas PET, bolsas, envases plásticos de alimentos)
- "vidrio"     (botellas o frascos de vidrio)
- "metal"      (latas de aluminio o conserva: gaseosa en lata, atún, cerveza en lata)
- "carton"     (cajas de cartón, cereales, cajas tipo Tetra Pak de leche/jugo aunque tengan tapa de plástico, envoltorios de papel)
- "organico"   (alimento sin empaque o empaque compostable: frutas, verduras, carnes, pan suelto)
- "general"    (empaque mixto no reciclable que NO se puede separar a mano, ej. bolsas de snacks/papitas/galletas con interior plateado metalizado — aunque tengan aluminio, van como no reciclable)
Si NO puedes ver el empaque con claridad (por ejemplo en un ticket de compra impreso, donde solo hay texto), usa "desconocido". NO ADIVINES el material si no es visible.
"""

def scan_receipt(image_bytes: bytes) -> list[dict]:
    prompt = f"""Analiza esta imagen. Puede ser un ticket de compra de supermercado o una foto de alimentos/refrigerador.

REGLAS ESTRICTAS:
1. SOLO incluye productos alimenticios o de despensa (comida, bebidas, lácteos, frutas, verduras, carnes, etc). EXCLUYE productos de limpieza o higiene (detergente, jabón, shampoo, papel higiénico, pañales) aunque aparezcan en el mismo ticket: esos NO van en la lista.
2. Si la imagen NO es un ticket de compra ni contiene alimentos reconocibles (por ejemplo: una tarjeta de presentación, un documento, un objeto no comestible, texto ilegible), responde exactamente: []
3. Si no estás seguro de qué es un producto o su nombre es ambiguo, OMÍTELO. Es preferible omitir un producto dudoso que inventar uno incorrecto.
4. NO inventes productos que no estén claramente visibles en la imagen.
5. Ignora nombres de tiendas, direcciones, totales, impuestos, números de teléfono, RUC/RFC y cualquier texto que no sea un producto alimenticio.
6. Si en el ticket aparece una cantidad mayor a 1 del mismo producto (ej: "2x Plátano", "3 Manzanas"), refleja esa cantidad real en "quantity" (ej: "2 unidades"), no la ignores ni la dejes en 1.
{PERU_SPANISH_NOTE}
{MATERIAL_NOTE}
Responde SOLO con un JSON válido, sin texto adicional, con este formato exacto:
[{{"name": "Leche Gloria", "price": 4.50, "quantity": "1L", "material": "carton"}}, ...]
Si no hay productos alimenticios claros, responde: []"""
    text = _call_vision(prompt, image_bytes)
    items = _parse_json(text)
    return [it for it in items if _is_valid_food_item(it.get("name", ""))]

def scan_fridge(image_bytes: bytes) -> list[dict]:
    prompt = f"""Analiza esta foto del interior de un refrigerador o de alimentos.

REGLAS ESTRICTAS:
1. SOLO identifica alimentos claramente visibles y reconocibles.
2. Si un objeto no es claramente un alimento, o no puedes identificarlo con certeza, OMÍTELO.
3. NO inventes alimentos que no estén en la imagen.
4. Cuenta cuántas unidades del mismo alimento ves (ej: si hay 2 piñas, "quantity" debe decir "2 unidades", no "1 unidad").
{PERU_SPANISH_NOTE}
{MATERIAL_NOTE}
Responde SOLO con un JSON válido, sin texto adicional, con este formato exacto:
[{{"name": "Tomates", "quantity": "3 unidades", "category": "verduras", "material": "organico"}}, ...]
Categorías posibles: frutas, verduras, lácteos, carnes, bebidas, otros
Si no puedes identificar nada con certeza, responde: []"""
    text = _call_vision(prompt, image_bytes)
    items = _parse_json(text)
    return [it for it in items if _is_valid_food_item(it.get("name", ""))]
