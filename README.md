# 🚗 Automobile Analytics & Business Advisor

An interactive, full-stack data analytics dashboard and business intelligence tool built to analyze vehicle market trends, depreciation curves, condition penalties, and regional pricing dynamics. 

🔗 **Live Web Application:** [https://automobile-analytics-app.vercel.app/](https://automobile-analytics-app.vercel.app/)  
📁 **GitHub Repository:** [https://github.com/Pratap338/automobile-analytics-app](https://github.com/Pratap338/automobile-analytics-app)

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Chart.js, `react-chartjs-2`, CSS3 (Deployed on **Vercel**)
* **Backend:** Python, FastAPI, Uvicorn, Pydantic (Deployed on **Render**)
* **Data Processing:** Pandas, NumPy
* **Dataset:** 5,500+ cleaned automobile records

---

## 📊 Core Data Insights Answered

This application processes raw automobile inventory data to derive statistical answers and visual charts for **10 critical data analyst questions**:

1. **Age vs. Price:** Calculates average 10-year valuation loss ($26,000+ drop).
2. **Mileage Impact:** Quantifies the financial penalty of passing 30k vs. 100k miles ($23,000+ drop).
3. **Accident History Penalty:** Measures the exact value loss for vehicles with recorded accidents ($9,200+ penalty).
4. **Service History Premium:** Evaluates the resale bonus for maintaining full service logs ($1,000+ premium).
5. **Ownership Depreciation:** Compares single-owner pricing against multi-owner vehicles.
6. **Fuel Efficiency Analysis:** Compares MPG / MPGe across Electric, Hybrid, Petrol, and Diesel models.
7. **Engine Performance:** Analyzes price correlations across Horsepower brackets.
8. **Body Type Trends:** Ranks market volume and price points across SUVs, Sedans, Coupes, and Hatchbacks.
9. **Regional Pricing:** Highlights location-based price variances across US states.
10. **Color Preference:** Correlates vehicle color choices with final resale values.

---

## 📁 Repository Structure

```text
automobile-analytics-app/
│
├── frontend/                  # React Frontend Application
│   ├── public/                # Static assets & HTML template
│   ├── src/
│   │   ├── App.js             # Visual Dashboard, Raw Data Table & 10 Insights Tabs
│   │   ├── App.css            # Custom Styling
│   │   └── index.js           # App Entry Point
│   └── package.json           # Frontend Dependencies
│
├── main.py                    # FastAPI Backend API & Analytics Engine
├── cleaned_automobile_dataset_2.csv # Processed Automobile Dataset
├── requirements.txt           # Python Dependencies
└── README.md                  # Project Documentation
