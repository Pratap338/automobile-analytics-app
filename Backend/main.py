from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel

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

class CarDetails(BaseModel):
    Make: str
    Model: str
    Year: int
    Mileage: int
    Selling_Price: float

@app.get("/api/inventory")
def get_inventory_data():
    result = df.to_dict(orient="records")
    return {"status": "success", "total_records_sent": len(result), "data": result}

@app.post("/api/advice")
def generate_business_advice(car: CarDetails):
    current_year = 2024
    age = current_year - car.Year
    
    if car.Mileage > 150000 and age > 10:
        strategy = f"High Risk: This {car.Year} {car.Make} is highly depreciated with {car.Mileage:,} miles. Recommend a quick wholesale liquidation to free up capital."
    elif car.Selling_Price > 40000:
        strategy = f"Premium Asset: The {car.Make} {car.Model} is a high-ticket item. Assign to senior sales staff and ensure pristine showroom presentation."
    else:
        strategy = f"Standard Retail: The {car.Make} {car.Model} is a reliable daily driver. Price it aggressively at ${car.Selling_Price:,.2f} for a fast turnaround."
        
    return {"advice": strategy}

@app.get("/api/insights")
def get_data_insights():
    
    def safe_mean(series):
        val = series.mean()
        return round(float(val), 2) if not pd.isna(val) else 0.0

    # 1. Age vs Price
    newer_price = safe_mean(df[df['Year'] >= 2021]['Selling_Price'])
    older_price = safe_mean(df[df['Year'] <= 2014]['Selling_Price'])
    age_drop = round(newer_price - older_price, 2)

    # 2. Mileage vs Price
    low_mile_price = safe_mean(df[df['Mileage'] < 30000]['Selling_Price'])
    high_mile_price = safe_mean(df[df['Mileage'] > 100000]['Selling_Price'])
    mileage_drop = round(low_mile_price - high_mile_price, 2)

    # 3. Accident History Penalty
    no_accident_price = safe_mean(df[df['Accident_History'] == 0]['Selling_Price'])
    accident_price = safe_mean(df[df['Accident_History'] > 0]['Selling_Price'])
    accident_penalty = round(no_accident_price - accident_price, 2)

    # 4. Service History Premium
    full_service_price = safe_mean(df[df['Service_History'] == 'Full Service']['Selling_Price'])
    no_service_price = safe_mean(df[df['Service_History'] == 'No Service']['Selling_Price'])
    service_premium = round(full_service_price - no_service_price, 2)

    # 5. Previous Owners Impact
    one_owner_price = safe_mean(df[df['Owners'] == 1]['Selling_Price'])
    multi_owner_price = safe_mean(df[df['Owners'] >= 4]['Selling_Price'])

    # 6. Fuel Efficiency by Fuel Type (Average MPG / MPGe)
    fuel_eff = df.groupby('Fuel_Type')['Fuel_Efficiency'].mean().round(1).to_dict()

    # 7. Horsepower Category vs Selling Price
    # Splitting horsepower into Low, Medium, High buckets
    df_temp = df.copy()
    df_temp['HP_Category'] = pd.qcut(df_temp['Horsepower'], 3, labels=['Low HP', 'Medium HP', 'High HP'])
    hp_price = df_temp.groupby('HP_Category', observed=False)['Selling_Price'].mean().round(0).to_dict()

    # 8. Average Price by Body Type
    body_prices = df.groupby('Body_Type')['Selling_Price'].mean().round(0).to_dict()

    # 9. Location Price Variations
    location_prices = df.groupby('Location')['Selling_Price'].mean().round(0).to_dict()

    # 10. Color Price Variations
    color_prices = df.groupby('Color')['Selling_Price'].mean().round(0).to_dict()

    
    return {
        # Q1
        "newer_price": newer_price,
        "older_price": older_price,
        "age_drop": age_drop,
        
        # Q2
        "low_mile_price": low_mile_price,
        "high_mile_price": high_mile_price,
        "mileage_drop": mileage_drop,
        
        # Q3
        "no_accident_price": no_accident_price,
        "accident_price": accident_price,
        "accident_penalty": accident_penalty,
        
        # Q4
        "full_service_price": full_service_price,
        "no_service_price": no_service_price,
        "service_premium": service_premium,
        
        # Q5
        "one_owner_price": one_owner_price,
        "multi_owner_price": multi_owner_price,
        
        # Q6 - Q10
        "fuel_eff": fuel_eff,
        "hp_price": hp_price,
        "body_prices": body_prices,
        "location_prices": location_prices,
        "color_prices": color_prices
    }