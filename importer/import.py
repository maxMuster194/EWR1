import pandas as pd
from pymongo import MongoClient
from bson.objectid import ObjectId

# === Einstellungen ===
excel_file = "S25.xlsx"   # deine Excel-Datei im selben Ordner
sheet = "Tabelle1"

# MongoDB-Verbindung (Atlas)
mongo_uri = "mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom"
db_name = "test"
collection_name = "S25"

# === Mongo-Verbindung ===
client = MongoClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]

# === Excel laden ===
df = pd.read_excel(excel_file, sheet_name=sheet)

# Erste Spalte = Zeitintervalle
days = df.columns[1:]  # alle Spalten ab 2 = Tage

for day in days:
    values = df[day].tolist()  # Liste mit 96 Werten
    values = [round(v / 100, 3) for v in values]  # Cent -> Euro
    
    # Dict mit Indexen 0-95
    parsed_extra = {str(i): values[i] for i in range(len(values))}
    
    doc = {
        "_id": ObjectId(),
        "date": day.strftime("%d/%m/%Y"),
        "__parsed_extra": parsed_extra,
        "__v": 0
    }
    
    collection.insert_one(doc)

print("✅ Import abgeschlossen! Alle Daten sind jetzt in test.S25.")
