import pandas as pd
import uuid
import random
import os
from sqlalchemy import create_engine
from elasticsearch import Elasticsearch

# Create mock CSVs
def generate_synthetic_data():
    base_businesses = [
        {"name": "Infosys Limited", "base_address": "Electronic City, Hosur Road", "pin": "560100", "pan": "ABCDE1234F"},
        {"name": "Wipro Technologies", "base_address": "Sarjapur Road, Doddakannelli", "pin": "560035", "pan": "ASDFG5678H"},
        {"name": "MTR Foods Pvt Ltd", "base_address": "Bommasandra Industrial Area", "pin": "560099", "pan": "QWERT9012J"},
        {"name": "Biocon", "base_address": "20th KM, Hosur Road, Electronic City", "pin": "560100", "pan": "ZXCVB3456K"},
        {"name": "Tata Silk Farm", "base_address": "Basavanagudi", "pin": "560004", "pan": "POIUY7890L"}
    ]

    shops = []
    factories = []
    kspcb = []

    for idx, b in enumerate(base_businesses):
        # Exact Match for Shop Est
        shops.append({
            "source_id": f"SHOP-{idx}",
            "source": "Shop Est",
            "name": b["name"],
            "address": b["base_address"],
            "pin": b["pin"],
            "pan": b["pan"],
            "status": "Active"
        })

        # Slightly mangled for Factories
        factories.append({
            "source_id": f"FACT-{idx}",
            "source": "Factories",
            "name": b["name"].replace("Limited", "Ltd.").replace("Pvt Ltd", "Private Limited"),
            "address": b["base_address"].upper() + ", BENGALURU",
            "pin": b["pin"],
            "pan": b["pan"] if random.random() > 0.3 else "", # 30% chance missing PAN
            "status": "Dormant" if random.random() > 0.8 else "Active"
        })

        # Another variation for KSPCB
        kspcb.append({
            "source_id": f"KSPCB-{idx}",
            "source": "KSPCB",
            "name": b["name"].split(" ")[0] + " Enterprise",
            "address": b["base_address"].lower(),
            "pin": b["pin"],
            "pan": "",
            "status": "Active"
        })

    os.makedirs("data", exist_ok=True)
    pd.DataFrame(shops).to_csv("data/shops.csv", index=False)
    pd.DataFrame(factories).to_csv("data/factories.csv", index=False)
    pd.DataFrame(kspcb).to_csv("data/kspcb.csv", index=False)
    print("Generated synthetic data in data/ folder.")

def load_to_db():
    try:
        # Load to Postgres
        engine = create_engine('postgresql://ubid_user:ubid_password@localhost:5432/ubid_db')
        
        shops_df = pd.read_csv("data/shops.csv")
        factories_df = pd.read_csv("data/factories.csv")
        kspcb_df = pd.read_csv("data/kspcb.csv")
        
        combined_df = pd.concat([shops_df, factories_df, kspcb_df])
        combined_df.to_sql('raw_businesses', engine, if_exists='replace', index=False)
        print("Loaded combined data to PostgreSQL (raw_businesses).")
    except Exception as e:
        print(f"Warning: PostgreSQL DB load failed (Ensure DB is running): {e}")

    try:
        # Load to Elasticsearch
        es = Elasticsearch("http://localhost:9200")
        if es.indices.exists(index="businesses"):
            es.indices.delete(index="businesses")
        es.indices.create(index="businesses")
        
        for _, row in combined_df.iterrows():
            es.index(index="businesses", document=row.to_dict())
        print("Loaded data to Elasticsearch.")
    except Exception as e:
        print(f"Warning: Elasticsearch load failed (Ensure ES is running): {e}")

if __name__ == "__main__":
    generate_synthetic_data()
    load_to_db()
