import requests
import csv
import json
import os
from datetime import datetime
import pandas as pd  # Hinzugefügt für XLSX-Export

# Konfiguration
API_URL = "http://localhost:3000/api/mongodb"  # Ersetze mit deiner tatsächlichen API-URL (z.B. http://deine-domain/api/germanyprices)
OUTPUT_DIR = "./"  # Ordner, in den die XLSX gespeichert werden soll (aktueller Ordner)
XLSX_FILENAME = "old_prices.xlsx"  # Name der Ausgabedatei (geändert zu XLSX)

def fetch_api_data(date=None):
    """
    Ruft Daten von der API ab.
    - date: Optional, Datum im Format 'YYYY-MM-DD' für Filter.
    """
    params = {}
    if date:
        params['date'] = date
    
    try:
        response = requests.get(API_URL, params=params)
        response.raise_for_status()  # Wirft Fehler bei HTTP-Fehlern
        data = response.json()
        return data.get('germany', [])  # Extrahiere den 'germany'-Array
    except requests.exceptions.RequestException as e:
        print(f"Fehler beim Abrufen der API: {e}")
        return []

def flatten_data(data):
    """
    Flacht die Daten ab, falls __parsed_extra oder andere nested Felder vorhanden sind.
    Annahme: Daten sind Liste von Dicts, z.B. {'deliveryday': '2025-10-15', 'h00': 45.2, ...}
    """
    flattened = []
    for item in data:
        flat_item = {}
        for key, value in item.items():
            if isinstance(value, list):  # z.B. __parsed_extra als Array
                for i, val in enumerate(value):
                    flat_item[f"{key}_{i}"] = val
            elif isinstance(value, dict):  # Falls nested Dicts
                for subkey, subval in value.items():
                    flat_item[f"{key}_{subkey}"] = subval
            else:
                flat_item[key] = value
        flattened.append(flat_item)
    return flattened

def export_to_xlsx(data, filename):
    """
    Exportiert die Daten als XLSX mit pandas.
    """
    if not data:
        print("Keine Daten zum Exportieren.")
        return
    
    # DataFrame erstellen (pandas kümmert sich um Header und Sortierung)
    df = pd.DataFrame(data)
    
    # Optionale Sortierung der Spalten (alphabetisch)
    df = df.reindex(sorted(df.columns), axis=1)
    
    # XLSX schreiben
    filepath = os.path.join(OUTPUT_DIR, filename)
    df.to_excel(filepath, index=False, engine='openpyxl')  # openpyxl für XLSX
    
    print(f"XLSX-Datei erfolgreich gespeichert: {filepath}")

def main():
    # Optional: Datum eingeben (z.B. für spezifisches Datum)
    date_input = input("Gib ein Datum ein (YYYY-MM-DD) oder drücke Enter für alle Daten: ").strip()
    date = date_input if date_input else None
    
    # Daten abrufen
    raw_data = fetch_api_data(date)
    
    # Daten flatten (falls nötig)
    flattened_data = flatten_data(raw_data)
    
    # Als XLSX exportieren
    export_to_xlsx(flattened_data, XLSX_FILENAME)

if __name__ == "__main__":
    main()