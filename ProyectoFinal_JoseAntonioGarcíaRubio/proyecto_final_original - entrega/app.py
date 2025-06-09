from flask import Flask, render_template, request, jsonify, send_file
import google.generativeai as genai
import os
import json
import re
import requests
import base64
from io import BytesIO

app = Flask(__name__)

# Configuración Gemini
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "Key.json"
genai.configure(api_key=None)
model = genai.GenerativeModel("gemini-2.0-flash-001")

# Configuración ElevenLabs
ELEVENLABS_API_KEY = "API_ElevenLabs"
ELEVENLABS_VOICE_ID = "9iaRiYAiGlZImkI1Ruyh"

# Diccionario de logos
LOGOS = {
    "Deportivo Alavés": "/static/images/escudos/alaves.png",
    "Athletic Club": "/static/images/escudos/athletic.png",
    "Atlético de Madrid": "/static/images/escudos/atletico.png",
    "FC Barcelona": "/static/images/escudos/barcelona.png",
    "Real Betis Balompié": "/static/images/escudos/betis.png",
    "RC Celta": "/static/images/escudos/celta.png",
    "RCD Espanyol": "/static/images/escudos/espanyol.png",
    "Getafe CF": "/static/images/escudos/getafe.png",
    "Girona FC": "/static/images/escudos/girona.png",
    "UD Las Palmas": "/static/images/escudos/laspalmas.png",
    "CD Leganés": "/static/images/escudos/leganes.png",
    "RCD Mallorca": "/static/images/escudos/mallorca.png",
    "CA Osasuna": "/static/images/escudos/osasuna.png",
    "Rayo Vallecano": "/static/images/escudos/rayovallecano.png",
    "Real Madrid CF": "/static/images/escudos/realmadrid.png",
    "Real Sociedad": "/static/images/escudos/realsociedad.png",
    "Sevilla FC": "/static/images/escudos/sevilla.png",
    "Valencia CF": "/static/images/escudos/valencia.png",
    "Real Valladolid": "/static/images/escudos/valladolid.png",
    "Villarreal CF": "/static/images/escudos/villarreal.png"
}

def obtener_logo(equipo):
    return LOGOS.get(equipo, "/static/images/escudos/default.png")

@app.route("/")
def index():
    return render_template("index.html", logos=LOGOS)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    equipo1 = data.get("equipo1")
    equipo2 = data.get("equipo2")

    if not equipo1 or not equipo2:
        return jsonify({"error": "Faltan equipos"}), 400

    prompt = f"""
Actúa como un analista de fútbol profesional. Genera un pronóstico detallado y realista del partido entre {equipo1} y {equipo2} que tenga entre 110 y 130 palabras. 
Incluye contexto reciente, claves tácticas y estado de forma.
Analiza el rendimiento de ambos equipos en las últimas tres temporadas de LaLiga (2021-22, 2022-23 y 2023-24), incluyendo las estadísticas clave: partidos ganados, empatados, perdidos, goles a favor, goles en contra y posición final en la tabla.

Asume que ambos equipos están actualmente en LaLiga (Primera División) en la temporada 2024-25, incluso si en temporadas pasadas no lo estuvieron.

⚠️ IMPORTANTE: Si alguno de los equipos no participó en alguna de esas temporadas en LaLiga, debes escribir **exactamente** la frase `"No compite"` (entre comillas) **en lugar de cada valor numérico** de esa temporada.

🚫 No uses en ningún caso valores como `undefined`, `null`, `None`, `no data`, `-`, cadenas vacías ni ninguna otra alternativa. Solo se permite `"No compite"`.

Además, proporciona:
- Un resumen histórico de enfrentamientos entre ambos equipos, con número total de victorias para cada uno, empates y total de partidos jugados.
- Una tabla con un máximo de 10 enfrentamientos recientes entre los dos equipos (ordenados del más reciente al más antiguo). Si no hay enfrentamientos previos, devuelve una lista vacía.
- Una lista de 5 jugadores históricos de cada club (solo nombres, sin explicaciones ni razones).

Devuelve exclusivamente un objeto JSON con esta estructura exacta (sin texto adicional, sin comentarios fuera del JSON):

{{
  "pronostico": "Texto del análisis aquí ...",
  "estadisticas": {{
    "{equipo1}": {{
      "2021-22": {{"wins": int/"No compite", "draws": int/"No compite", "losses": int/"No compite", "gf": int/"No compite", "ga": int/"No compite", "pos": int/"No compite"}},
      "2022-23": {{"wins": int/"No compite", "draws": int/"No compite", "losses": int/"No compite", "gf": int/"No compite", "ga": int/"No compite", "pos": int/"No compite"}},
      "2023-24": {{"wins": int/"No compite", "draws": int/"No compite", "losses": int/"No compite", "gf": int/"No compite", "ga": int/"No compite", "pos": int/"No compite"}}
    }},
    "{equipo2}": {{
      "2021-22": {{"wins": int/"No compite", "draws": int/"No compite", "losses": int/"No compite", "gf": int/"No compite", "ga": int/"No compite", "pos": int/"No compite"}},
      "2022-23": {{"wins": int/"No compite", "draws": int/"No compite", "losses": int/"No compite", "gf": int/"No compite", "ga": int/"No compite", "pos": int/"No compite"}},
      "2023-24": {{"wins": int/"No compite", "draws": int/"No compite", "losses": int/"No compite", "gf": int/"No compite", "ga": int/"No compite", "pos": int/"No compite"}}
    }}
  }},
  "enfrentamientos_historicos": {{
    "resumen": {{
      "{equipo1}_victorias": int,
      "{equipo2}_victorias": int,
      "empates": int,
      "total_partidos": int
    }},
    "ultimos_partidos": [
      {{
        "fecha": "YYYY-MM-DD",
        "competicion": "Nombre de la competición",
        "resultado": "Equipo1 X - Y Equipo2"
      }}
    ]
  }},
  "jugadores_historicos": {{
    "{equipo1}": [
      "Nombre del jugador 1",
      "Nombre del jugador 2",
      "Nombre del jugador 3",
      "Nombre del jugador 4",
      "Nombre del jugador 5"      
    ],
    "{equipo2}": [
      "Nombre del jugador 1",
      "Nombre del jugador 2",
      "Nombre del jugador 3",
      "Nombre del jugador 4",
      "Nombre del jugador 5"
    ]
  }}
}}
"""




    try:
        response = model.generate_content(prompt)
        match = re.search(r'{.*}', response.text, re.DOTALL)
        if not match:
            return jsonify({"error": "No se pudo extraer JSON del modelo."}), 500

        json_data = json.loads(match.group())
        json_data["equipos"] = {
            equipo1: {"logo": LOGOS.get(equipo1)},
            equipo2: {"logo": LOGOS.get(equipo2)},
        }

        return jsonify(json_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/audio", methods=["POST"])
def audio():
    data = request.get_json()
    texto = data.get("texto")
    if not texto:
        return jsonify({"error": "Texto no proporcionado"}), 400

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "text": texto,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.7
        }
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        return jsonify({"error": "Error al generar el audio con ElevenLabs"}), 500

    return send_file(BytesIO(response.content), mimetype="audio/mpeg")

@app.route("/download_pdf", methods=["POST"])
def download_pdf():
    data = request.get_json()
    equipo1 = data.get("equipo1")
    equipo2 = data.get("equipo2")

    
    pdf_bytes = BytesIO()
    pdf_bytes.write(b'%PDF-1.4 ... contenido del pdf ...')
    pdf_bytes.seek(0)

    filename = f"{equipo1}v{equipo2}.pdf"

    return send_file(pdf_bytes, download_name=filename, as_attachment=True, mimetype='application/pdf')

if __name__ == "__main__":
    app.run(debug=True)
