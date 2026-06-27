from twilio.rest import Client
import os

def send_whatsapp(to_number: str, message: str):
    try:
        client = Client(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
        client.messages.create(
            from_=os.getenv("TWILIO_WHATSAPP_FROM"),
            body=message,
            to=f"whatsapp:{to_number}"
        )
        return True
    except Exception as e:
        print(f"WhatsApp error: {e}")
        return False

def format_expiry_message(product_name: str, days_left: int) -> str:
    if days_left < 0:
        return f"FreshTrack: Tu {product_name} ya venció. Considera tirarlo para evitar desperdicios."
    elif days_left == 0:
        return f"FreshTrack: ¡Alerta! Tu {product_name} vence HOY. Úsalo pronto."
    elif days_left == 1:
        return f"FreshTrack: Tu {product_name} vence MAÑANA. No lo olvides."
    else:
        return f"FreshTrack: Tu {product_name} vence en {days_left} días. Recuerda usarlo."
