from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
dataset_path = "cleaned_automobile_dataset_2.csv"
df = pd.read_csv(dataset_path)
df = df.fillna("N/A")
@app.get("/api/inventory")
def get_inventory_data():
    """
    This endpoint takes the Pandas DataFrame, converts it to a dictionary, 
    and sends it to the frontend as JSON.
    """
    # For testing, let's just send the first 100 cars so the browser loads instantly
    data_sample = df.head(100)
    
    # Convert the pandas data into a standard web format (JSON)
    result = data_sample.to_dict(orient="records")
    
    return {"status": "success", "total_records_sent": len(result), "data": result}

# 5. Create a simple health check endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to the Automobile Data Server! The API is running."}