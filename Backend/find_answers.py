import pandas as pd

# 1. Load your dataset
print("Loading data...")
df = pd.read_csv("cleaned_automobile_dataset_2.csv")


print("\n--- ANSWERING QUESTION 1 (AGE VS PRICE) ---")


newer_cars = df[df['Year'] >= 2021]
avg_price_newer = newer_cars['Selling_Price'].mean()


older_cars = df[df['Year'] <= 2014]
avg_price_older = older_cars['Selling_Price'].mean()

print(f"Average price of a Newer Car (2021 or newer): ${avg_price_newer:,.2f}")
print(f"Average price of an Older Car (2014 or older): ${avg_price_older:,.2f}")

# Calculate the drop
age_price_drop = avg_price_newer - avg_price_older
print(f"CONCLUSION: On average, a car loses ${age_price_drop:,.2f} in value over a 10-year period.")


print("\n--- ANSWERING QUESTION 2 (MILEAGE VS PRICE) ---")

# We group cars with very low miles (Under 30,000)
low_mileage = df[df['Mileage'] < 30000]
avg_price_low_miles = low_mileage['Selling_Price'].mean()

# We group cars with very high miles (Over 100,000)
high_mileage = df[df['Mileage'] > 100000]
avg_price_high_miles = high_mileage['Selling_Price'].mean()

print(f"Average price of a Low Mileage car (Under 30k miles): ${avg_price_low_miles:,.2f}")
print(f"Average price of a High Mileage car (Over 100k miles): ${avg_price_high_miles:,.2f}")

# Calculate the drop
mileage_price_drop = avg_price_low_miles - avg_price_high_miles
print(f"CONCLUSION: Pushing a car past 100,000 miles drops its value by an average of ${mileage_price_drop:,.2f} compared to a low-mileage car.")