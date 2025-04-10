from flask import Flask, render_template, request
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
import requests

app = Flask(__name__)

# Configurar modelo de lenguaje
model_name = "google/gemma-2b"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")

# Configuración de la API de fútbol
API_KEY = "e258827256f953e89b02aa31c779dd94"
BASE_URL = "https://v3.football.api-sports.io"

def get_team_id(team_name):
    url = f"{BASE_URL}/teams?search={team_name}"
    headers = {"x-apisports-key": API_KEY}
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return None
    data = response.json()
    if "response" in data and data["response"]:
        return data["response"][0]["team"]["id"]
    return None

def get_team_stats(team_id):
    stats_summary = {
        "wins": 0,
        "draws": 0,
        "losses": 0,
        "goals_scored": 0,
        "goals_conceded": 0
    }
    season_stats = {}
    for season in range(2021, 2024):
        url = f"{BASE_URL}/teams/statistics?team={team_id}&league=140&season={season}"
        headers = {"x-apisports-key": API_KEY}
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            continue
        data = response.json().get("response", {})
        wins = data.get("fixtures", {}).get("wins", {})
        draws = data.get("fixtures", {}).get("draws", {})
        loses = data.get("fixtures", {}).get("loses", {})
        goals_for = data.get("goals", {}).get("for", {}).get("total", {})
        goals_against = data.get("goals", {}).get("against", {}).get("total", {})

        stats_summary["wins"] += wins.get("total", 0)
        stats_summary["draws"] += draws.get("total", 0)
        stats_summary["losses"] += loses.get("total", 0)
        stats_summary["goals_scored"] += goals_for.get("total", 0) if isinstance(goals_for.get("total", 0), int) else 0
        stats_summary["goals_conceded"] += goals_against.get("total", 0) if isinstance(goals_against.get("total", 0), int) else 0

        season_stats[str(season)] = {
            "wins": {
                "local": wins.get("home", 0),
                "visitante": wins.get("away", 0),
                "total": wins.get("total", 0)
            },
            "draws": {
                "local": draws.get("home", 0),
                "visitante": draws.get("away", 0),
                "total": draws.get("total", 0)
            },
            "losses": {
                "local": loses.get("home", 0),
                "visitante": loses.get("away", 0),
                "total": loses.get("total", 0)
            },
            "goals_scored": {
                "local": goals_for.get("home", 0),
                "visitante": goals_for.get("away", 0),
                "total": goals_for.get("total", 0)
            },
            "goals_conceded": {
                "local": goals_against.get("home", 0),
                "visitante": goals_against.get("away", 0),
                "total": goals_against.get("total", 0)
            }
        }
    return stats_summary, season_stats

def get_match_prediction(team1, team2):
    team1_id = get_team_id(team1.strip())
    team2_id = get_team_id(team2.strip())
    if not team1_id or not team2_id:
        return {"error": "No se encontraron equipos. Verifica los nombres."}

    team1_stats, team1_season_stats = get_team_stats(team1_id)
    team2_stats, team2_season_stats = get_team_stats(team2_id)
    if not team1_stats or not team2_stats:
        return {"error": "No se pudieron obtener las estadísticas."}

    # Calcular totales individuales
    total1 = team1_stats['wins'] + team1_stats['draws'] + team1_stats['losses']
    total2 = team2_stats['wins'] + team2_stats['draws'] + team2_stats['losses']

    # Calcular probabilidades relativas de cada equipo
    p1 = team1_stats['wins'] / total1 if total1 > 0 else 0
    p2 = team2_stats['wins'] / total2 if total2 > 0 else 0
    empate = ((team1_stats['draws'] / total1) + (team2_stats['draws'] / total2)) / 2 if total1 > 0 and total2 > 0 else 0

    # Normalizar para que sumen 1
    suma = p1 + p2 + empate
    p1 /= suma
    p2 /= suma
    empate /= suma

    predicciones = {
        f"victoria del {team1.lower()}": f"{round(p1 * 100)}%",
        "empate": f"{round(empate * 100)}%",
        f"victoria del {team2.lower()}": f"{round(p2 * 100)}%"
    }

    # Análisis
    if p1 > 0.5:
        favorito = team1
    elif p2 > 0.5:
        favorito = team2
    else:
        favorito = None

    if favorito:
        analisis = f"Es muy probable que {favorito} gane este partido, según las estadísticas de LaLiga (2021-2023)."
    else:
        analisis = f"Este partido entre {team1} y {team2} está muy igualado según las estadísticas de LaLiga."

    return {
        "partido": f"{team1} vs {team2}",
        "predicciones": predicciones,
        "analisis": analisis,
        "estadisticas": {
            team1: team1_season_stats,
            team2: team2_season_stats
        }
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        user_input = request.form['team_names']
        teams = [team.strip() for team in user_input.split(",")]

        if len(teams) != 2:
         return render_template('index.html', error="Ingresa exactamente dos equipos separados por coma.")


        prediction = get_match_prediction(teams[0], teams[1])

        return render_template('index.html', prediction=prediction)

if __name__ == '__main__':
    app.run(debug=True)
