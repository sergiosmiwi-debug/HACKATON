from datetime import datetime, timedelta

SHELF_LIFE = {
    # Lácteos
    "leche": {"closed": 7, "opened": 3},
    "yogur": {"closed": 14, "opened": 5},
    "queso": {"closed": 14, "opened": 7},
    "mantequilla": {"closed": 30, "opened": 14},
    "crema": {"closed": 14, "opened": 5},
    "margarina": {"closed": 60, "opened": 30},
    # Proteínas
    "huevos": {"closed": 21, "opened": 21},
    "pollo": {"closed": 2, "opened": 1},
    "carne": {"closed": 3, "opened": 2},
    "pescado": {"closed": 2, "opened": 1},
    "jamón": {"closed": 7, "opened": 4},
    "jamon": {"closed": 7, "opened": 4},
    "salchicha": {"closed": 7, "opened": 4},
    "hot dog": {"closed": 7, "opened": 4},
    # Frutas y verduras (sin empaque — vida igual abierto/cerrado)
    "tomate": {"closed": 5, "opened": 5},
    "lechuga": {"closed": 5, "opened": 5},
    "zanahoria": {"closed": 14, "opened": 14},
    "manzana": {"closed": 14, "opened": 14},
    "naranja": {"closed": 14, "opened": 14},
    "mandarina": {"closed": 10, "opened": 10},
    "platano": {"closed": 5, "opened": 5},
    "banana": {"closed": 5, "opened": 5},
    "palta": {"closed": 4, "opened": 4},
    "uva": {"closed": 7, "opened": 7},
    "pera": {"closed": 10, "opened": 10},
    "durazno": {"closed": 5, "opened": 5},
    "fresa": {"closed": 4, "opened": 4},
    "piña": {"closed": 5, "opened": 5},
    "pina": {"closed": 5, "opened": 5},
    "sandia": {"closed": 7, "opened": 4},
    "melon": {"closed": 7, "opened": 4},
    "limon": {"closed": 14, "opened": 14},
    "papa": {"closed": 21, "opened": 21},
    "cebolla": {"closed": 21, "opened": 21},
    "choclo": {"closed": 3, "opened": 3},
    "pepino": {"closed": 7, "opened": 7},
    "brocoli": {"closed": 5, "opened": 5},
    "brócoli": {"closed": 5, "opened": 5},
    "espinaca": {"closed": 4, "opened": 4},
    "camote": {"closed": 21, "opened": 21},
    "betarraga": {"closed": 14, "opened": 14},
    # Panadería
    "pan": {"closed": 5, "opened": 3},
    # Bebidas
    "jugo": {"closed": 14, "opened": 5},
    "nectar": {"closed": 180, "opened": 5},
    "néctar": {"closed": 180, "opened": 5},
    "refresco": {"closed": 180, "opened": 3},
    "gaseosa": {"closed": 180, "opened": 3},
    "cerveza": {"closed": 270, "opened": 1},
    "vino": {"closed": 365, "opened": 5},
    "agua": {"closed": 730, "opened": 3},
    # Aceites y condimentos — duran meses una vez abiertos
    "aceite": {"closed": 365, "opened": 60},
    "vinagre": {"closed": 730, "opened": 365},
    "ketchup": {"closed": 365, "opened": 30},
    "mayonesa": {"closed": 90, "opened": 30},
    "mayones": {"closed": 90, "opened": 30},
    "mostaza": {"closed": 365, "opened": 90},
    "soya": {"closed": 365, "opened": 90},
    "ají": {"closed": 180, "opened": 30},
    "salsa": {"closed": 180, "opened": 14},
    "mermelada": {"closed": 365, "opened": 30},
    "miel": {"closed": 730, "opened": 365},
    # Secos y enlatados — prácticamente no vencen cerrados
    "arroz": {"closed": 730, "opened": 180},
    "fideo": {"closed": 730, "opened": 180},
    "fideos": {"closed": 730, "opened": 180},
    "pasta": {"closed": 730, "opened": 180},
    "harina": {"closed": 365, "opened": 90},
    "azúcar": {"closed": 730, "opened": 365},
    "azucar": {"closed": 730, "opened": 365},
    "sal": {"closed": 1825, "opened": 1825},
    "atún": {"closed": 1095, "opened": 2},
    "atun": {"closed": 1095, "opened": 2},
    "sardina": {"closed": 1095, "opened": 2},
    "conserva": {"closed": 1095, "opened": 3},
    "lenteja": {"closed": 730, "opened": 180},
    "frijol": {"closed": 730, "opened": 180},
    "garbanzo": {"closed": 730, "opened": 180},
    "avena": {"closed": 365, "opened": 90},
    # Snacks
    "galleta": {"closed": 180, "opened": 14},
    "chips": {"closed": 90, "opened": 3},
    "chocolate": {"closed": 365, "opened": 30},
    # Sellado sin fecha clara: no penaliza hasta abrir
    "default": {"closed": 365, "opened": 30},
}

def get_shelf_life(product_name: str, opened: bool = False) -> int:
    name_lower = product_name.lower()
    for key in SHELF_LIFE:
        if key in name_lower:
            return SHELF_LIFE[key]["opened" if opened else "closed"]
    return SHELF_LIFE["default"]["opened" if opened else "closed"]

def calculate_expiry(product_name: str, purchase_date: datetime, opened_date: datetime = None) -> datetime:
    if opened_date:
        days = get_shelf_life(product_name, opened=True)
        return opened_date + timedelta(days=days)
    days = get_shelf_life(product_name, opened=False)
    return purchase_date + timedelta(days=days)

def get_status(expiry_date: datetime) -> str:
    now = datetime.utcnow()
    days_left = (expiry_date - now).days
    if days_left < 0:
        return "expired"
    elif days_left <= 1:
        return "danger"
    elif days_left <= 3:
        return "warning"
    return "fresh"
