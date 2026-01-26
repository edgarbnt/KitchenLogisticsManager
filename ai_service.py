import os
import json
import re
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def scan_receipt_with_gemini(image_bytes: bytes):
    # Liste des noms de modèles à essayer par ordre de priorité
    # gemini-flash-latest est souvent le nom 'alias' qui fonctionne sur le Tier Gratuit
    model_candidates = ['gemini-1.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash-002']
    
    last_error = None

    for model_name in model_candidates:
        try:
            print(f"--- Tentative avec le modèle : {model_name} ---")
            
            prompt = """
            Analyze this grocery receipt. Extract all food items. 
            Return ONLY a JSON array of objects:
            [{"name": "string", "quantity": number, "unit": "string"}].
            Normalize units to 'kg', 'g', 'l', or 'unit'. 
            Return ONLY the raw JSON.
            """

            response = client.models.generate_content(
                model=model_name,
                contents=[
                    prompt,
                    types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg')
                ]
            )

            text = response.text
            # Nettoyage JSON
            text = text.replace('```json', '').replace('```', '').strip()
            match = re.search(r'\[.*\]', text, re.DOTALL)
            
            if match:
                return json.loads(match.group(0))
            return json.loads(text)

        except Exception as e:
            last_error = e
            error_msg = str(e)
            print(f"Échec avec {model_name}: {error_msg[:100]}...")
            
            # Si c'est une erreur de quota (429), on attend 2 secondes et on change de modèle
            if "429" in error_msg:
                time.sleep(2)
            # On continue la boucle pour essayer le modèle suivant
            continue

    # Si on arrive ici, aucun modèle n'a fonctionné
    print(f"ERREUR FATALE AI : Aucun modèle n'a répondu favorablement.")
    raise last_error