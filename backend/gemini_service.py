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
REGLA CRÍTICA DE IDIOMA: TODOS los nombres de productos deben estar en español de Perú.
Si no sabes el nombre en español peruano de un producto, OMÍTELO — es preferible omitirlo
a escribirlo en italiano, inglés, francés u otro idioma. NUNCA uses palabras extranjeras.

Traducciones obligatorias al español peruano:
VERDURAS Y FRUTAS:
- elote / choclo → choclo
- aguacate / avocado → palta
- batata / boniato / sweet potato → camote
- banana / banano → plátano
- zucchini / zapallito / courgette → zapallito italiano
- blueberry → arándano
- strawberry → fresa
- pineapple → piña
- corn → choclo
- potato → papa
- onion → cebolla
- garlic → ajo
- ginger → jengibre
- tomato → tomate
- spinach → espinaca
- broccoli → brócoli
- lettuce → lechuga
- carrot → zanahoria
- cucumber → pepino
- beetroot → betarraga
- pumpkin / zapallo → zapallo
- mushroom / champiñón → champiñones

HIERBAS:
- basilico / basil / albahaca italiana → albahaca
- cilantro / coriander → culantro (en Perú se dice culantro)
- parsley → perejil
- mint / hierbabuena → hierbabuena
- oregano → orégano

PROTEÍNAS Y LÁCTEOS:
- chicken → pollo
- beef / meat → carne
- fish → pescado
- pork → cerdo
- milk → leche
- butter → mantequilla
- cheese → queso
- egg / eggs → huevos
- yogurt → yogur

OTROS:
- frijoles / porotos / beans → frejoles o menestras
- rice → arroz
- oil → aceite
- sugar → azúcar
- flour → harina
- bread → pan
- juice → jugo
- water → agua
- beer → cerveza
- wine → vino
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
    prompt = f"""Analiza esta imagen de un ticket de compra o foto de alimentos.

REGLAS ESTRICTAS — léelas todas antes de responder:
1. SOLO incluye alimentos y bebidas. EXCLUYE limpieza, higiene, papelería y cualquier no-alimento.
2. Si la imagen no contiene alimentos reconocibles, responde exactamente: []
3. Si NO puedes leer claramente el nombre de un producto, OMÍTELO. Nunca adivines ni inventes.
4. Si el nombre de un producto no lo sabes en español peruano, OMÍTELO — nunca uses palabras en italiano, inglés u otro idioma.
5. Ignora tiendas, direcciones, totales, impuestos, RUC/RFC, teléfonos.
6. Si hay cantidad mayor a 1 (ej: "2x Plátano"), ponla en "quantity" (ej: "2 unidades").
{PERU_SPANISH_NOTE}
{MATERIAL_NOTE}
Responde SOLO con JSON válido, sin texto extra:
[{{"name": "Leche Gloria", "price": 4.50, "quantity": "1L", "material": "carton"}}, ...]
Si no hay productos alimenticios claros: []"""
    text = _call_vision(prompt, image_bytes)
    items = _parse_json(text)
    return [it for it in items if _is_valid_food_item(it.get("name", ""))]

def scan_fridge(image_bytes: bytes) -> list[dict]:
    prompt = f"""Analiza esta foto de un refrigerador o alimentos.

REGLAS ESTRICTAS — léelas todas antes de responder:
1. SOLO identifica alimentos claramente visibles. Si no puedes identificarlo con total certeza, OMÍTELO.
2. NO inventes ni supongas alimentos. Si algo es dudoso, no lo incluyas.
3. Si NO sabes el nombre en español peruano de lo que ves, OMÍTELO — nunca escribas en italiano, inglés u otro idioma.
4. Cuenta las unidades reales que ves (2 piñas → "2 unidades").
{PERU_SPANISH_NOTE}
{MATERIAL_NOTE}
Responde SOLO con JSON válido, sin texto extra:
[{{"name": "Tomates", "quantity": "3 unidades", "category": "verduras", "material": "organico"}}, ...]
Categorías: frutas, verduras, lácteos, carnes, bebidas, otros
Si no identificas nada con certeza: []"""
    text = _call_vision(prompt, image_bytes)
    items = _parse_json(text)
    return [it for it in items if _is_valid_food_item(it.get("name", ""))]
