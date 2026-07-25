import pandas as pd

# 1. Load the dataset
print("Loading data...")
df = pd.read_csv("cleaned_automobile_dataset_2.csv")

# ---------------------------------------------------------
# QUESTION 1: How much does an Accident History drop the price?
# ---------------------------------------------------------
print("\n--- ANSWERING: ACCIDENT HISTORY VS PRICE ---")

# Group cars with zero accidents (Column is 'Accident_History')
clean_record_cars = df[df['Accident_History'] == 0]
avg_price_clean = clean_record_cars['Selling_Price'].mean()

# Group cars with 1 or more accidents
accident_cars = df[df['Accident_History'] > 0]
avg_price_accident = accident_cars['Selling_Price'].mean()

print(f"Average price with a Clean Record: ${avg_price_clean:,.2f}")
print(f"Average price with an Accident History: ${avg_price_accident:,.2f}")

# Calculate the financial penalty
accident_penalty = avg_price_clean - avg_price_accident
print(f"CONCLUSION: Having an accident on record drops the car's value by ${accident_penalty:,.2f}.")


# ---------------------------------------------------------
# QUESTION 2: Do buyers pay more for a "Full Service History"?
# ---------------------------------------------------------
print("\n--- ANSWERING: SERVICE HISTORY VS PRICE ---")

# Group cars that have 'Full Service' documented (Value is 'Full Service')
full_service = df[df['Service_History'] == 'Full Service']
avg_price_full_service = full_service['Selling_Price'].mean()

# Group cars that have Partial, No, or Unknown service history
no_full_service = df[df['Service_History'] != 'Full Service']
avg_price_no_service = no_full_service['Selling_Price'].mean()

print(f"Average price with Full Service History: ${avg_price_full_service:,.2f}")
print(f"Average price without Full History: ${avg_price_no_service:,.2f}")

# Calculate the bonus value of keeping good records
service_bonus = avg_price_full_service - avg_price_no_service
print(f"CONCLUSION: Keeping a Full Service History earns a seller an extra ${service_bonus:,.2f} on average.")