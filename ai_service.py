import os
import json
import re
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Initialisation du nouveau client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def get_flash_model_name():
    """Détermine dynamiquement le nom du modèle Flash disponible avec le nouveau SDK."""
    try:
        # On liste les modèles via le nouveau client
        for m in client.models.list():
            # On cherche 'flash' dans le nom et le support de la génération de contenu
            if 'flash' in m.name.lower() and 'generateContent' in m.supported_generation_methods:
                return m.name
        return 'gemini-1.5-flash' # Fallback
    except Exception as e:
        print(f"Erreur lors du listage des modèles : {e}")
        return 'gemini-1.5-flash'

def scan_receipt_with_gemini(image_bytes: bytes):
    model_name = get_flash_model_name()
    print(f"--- Utilisation du modèle (SDK v1) : {model_name} ---")
    
    try:
        prompt = """
        Analyze this grocery receipt. Extract all food items. 
        Return ONLY a JSON array of objects:
        [{"name": "string", "quantity": number, "unit": "string"}].
        Normalize units to 'kg', 'g', 'l', or 'unit'. 
        Return ONLY the raw JSON.
        """

        # Envoi de la requête avec le nouveau SDK
        response = client.models.generate_content(
            model=model_name,
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg')
            ]
        )

        # Récupération du texte
        text = response.text
        
        # Logique d'extraction JSON identique à ton ancienne version (très fiable)
        match = re.search(r'\[.*\]', text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        
        clean_json = text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)

    except Exception as e:
        print(f"ERREUR CRITIQUE AI : {str(e)}")
        # Aide au debug en cas d'échec
        try:
            available = [m.name for m in client.models.list()]
            print(f"Modèles disponibles sur ce compte : {available}")
        except:
            pass
        raise e