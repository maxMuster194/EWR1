import pandas as pd
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

# === Einstellungen ===
excel_file = "old_prices.xlsx"  # deine Excel-Datei im selben Ordner
sheet = "Tabelle1"  # Sheet-Name

# MongoDB-Verbindung (Atlas)
mongo_uri = "mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom"
db_name = "test"
collection_name = "min15Prices"

# === Mongo-Verbindung ===
try:
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db[collection_name]
except Exception as e:
    raise ValueError(f"Fehler bei der MongoDB-Verbindung: {e}")

# === Excel laden, erste Zeile überspringen ===
try:
    df = pd.read_excel(excel_file, sheet_name=sheet, skiprows=1)
except Exception as e:
    raise ValueError(f"Fehler beim Laden der Excel-Datei: {e}")

# Spaltennamen ausgeben, um Debugging zu erleichtern
print("Spaltennamen in der Excel-Datei:", df.columns.tolist())

# Spalte A als Datumsspalte (sollte 'Delivery day' sein)
date_column = "Delivery day"
if date_column not in df.columns:
    raise ValueError(f"Datumsspalte '{date_column}' nicht gefunden. Verfügbare Spalten: {df.columns.tolist()}")

# Stündliche Spalten (Hour 1, Hour 2, Hour 3A, Hour 3B, Hour 4, ..., Hour 24)
hour_columns = [f"Hour {i}" for i in range(1, 25)]
hour_columns[2] = "Hour 3A"  # Ersetze Hour 3 durch Hour 3A
hour_columns.insert(3, "Hour 3B")  # Füge Hour 3B nach Hour 3A ein
hour_columns = hour_columns[:24]  # Behalte nur die ersten 24 Stunden

# Zusätzliche Spalten
additional_columns = [
    "Afternoon", "Baseload", "Business", "Early afternoon", "Early morning",
    "Evening", "High noon", "Late morning", "Maximum", "Middle night",
    "Minimum", "Morning", "Night", "Off-peak", "Off-peak 1", "Off-peak 2",
    "Peakload", "Rush hour", "Sun peak"
]

# Überprüfen, ob alle benötigten Spalten vorhanden sind
required_columns = [date_column] + hour_columns + additional_columns
missing_columns = [col for col in required_columns if col not in df.columns]
if missing_columns:
    raise ValueError(f"Folgende Spalten fehlen: {missing_columns}")

# Spezifische Überprüfung für Hour 24
if "Hour 24" not in df.columns:
    raise ValueError("Spalte 'Hour 24' fehlt in der Excel-Datei. Bitte überprüfe die Spaltennamen.")

for index, row in df.iterrows():
    # Datum aus Spalte 'Delivery day' direkt verwenden (erwartet Format DD/MM/YYYY)
    try:
        delivery_date = pd.to_datetime(row[date_column], format="%d/%m/%Y").strftime("%d/%m/%Y")
    except ValueError as e:
        raise ValueError(f"Ungültiges Datumsformat in Spalte 'Delivery day', Zeile {index + 2}: {row[date_column]}") from e
    
    # Debugging: Wert von Hour 24 ausgeben
    hour_24_value = row["Hour 24"]
    print(f"Zeile {index + 2}: Hour 24 Wert = {hour_24_value}, Typ = {type(hour_24_value)}")

    # Dokument für MongoDB erstellen
    doc = {
        "_id": ObjectId(),
        "Delivery day": delivery_date,
        "__v": 0
    }
    
    # Viertelstunden-Werte aus stündlichen Werten ableiten
    for i, hour in enumerate(hour_columns):
        value = row[hour]
        # Debugging für jede Stunde
        print(f"Zeile {index + 2}: Verarbeite {hour} mit Wert = {value}, Typ = {type(value)}")
        # Behandle null-Werte
        if pd.isna(value):
            print(f"Zeile {index + 2}: {hour} ist NaN, setze Q1-Q4 auf None")
            for q in ["Q1", "Q2", "Q3", "Q4"]:
                doc[f"{hour} {q}"] = None
        else:
            try:
                # Konvertiere Wert zu float, behandele Kommas als Dezimaltrennzeichen
                float_value = float(str(value).replace(',', '.') if isinstance(value, str) else value)
                doc[f"{hour} Q1"] = float_value
                doc[f"{hour} Q2"] = float_value
                doc[f"{hour} Q3"] = float_value
                doc[f"{hour} Q4"] = float_value
                if hour == "Hour 24":
                    print(f"Zeile {index + 2}: Hour 24 Q1-Q4 gesetzt auf {float_value}")
            except (ValueError, TypeError) as e:
                print(f"Fehler beim Konvertieren von {hour} in Zeile {index + 2}: {e}")
                for q in ["Q1", "Q2", "Q3", "Q4"]:
                    doc[f"{hour} {q}"] = None
    
    # Zusätzliche Werte hinzufügen
    for col in additional_columns:
        value = row[col]
        try:
            doc[col] = None if pd.isna(value) else float(str(value).replace(',', '.') if isinstance(value, str) else value)
        except (ValueError, TypeError) as e:
            print(f"Fehler beim Konvertieren von {col} in Zeile {index + 2}: {e}")
            doc[col] = None

    # Dokument in die Collection einfügen
    try:
        collection.insert_one(doc)
        print(f"Zeile {index + 2}: Dokument erfolgreich in MongoDB eingefügt")
    except Exception as e:
        print(f"Fehler beim Einfügen von Zeile {index + 2} in MongoDB: {e}")

print("✅ Import abgeschlossen! Alle Daten sind jetzt in test.old_prices.")