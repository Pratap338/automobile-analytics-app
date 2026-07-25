import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement, 
  PointElement 
} from 'chart.js';
import { Bar, Doughnut, Scatter } from 'react-chartjs-2';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement);

// Define API base URL - replace this with your actual Render service URL when live!
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://automobile-analytics-app.onrender.com';

function App() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMake, setSelectedMake] = useState('All');
  const [advisorMessage, setAdvisorMessage] = useState("");
  
  // State for calculated backend analytics
  const [insights, setInsights] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; 
  const [activeTab, setActiveTab] = useState('dashboard'); 

  useEffect(() => {
    // FIXED: Added /api/inventory path and used production API variable
    fetch(`${API_BASE_URL}/api/inventory`)
      .then(response => response.json())
      .then(data => {
        setInventory(data.data || []); 
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching inventory:", error);
        setLoading(false);
      });

    fetch(`${API_BASE_URL}/api/insights`)
      .then(response => response.json())
      .then(data => setInsights(data))
      .catch(error => console.error("Error fetching insights:", error));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMake]);

  const handleRowClick = (car) => {
    setAdvisorMessage("Analyzing vehicle data..."); 
    fetch(`${API_BASE_URL}/api/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Make: car.Make,
        Model: car.Model,
        Year: car.Year,
        Mileage: car.Mileage,
        Selling_Price: car.Selling_Price
      })
    })
    .then(response => response.json())
    .then(data => setAdvisorMessage(data.advice))
    .catch(() => setAdvisorMessage("Error contacting advisor."));
  };

  const uniqueMakes = ['All', ...new Set(inventory.map(car => car.Make))];
  const filteredInventory = selectedMake === 'All' 
    ? inventory 
    : inventory.filter(car => car.Make === selectedMake);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredInventory.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredInventory.length / rowsPerPage);

  // --- DASHBOARD CHARTS ---
  const brandCounts = {};
  filteredInventory.forEach(car => {
    brandCounts[car.Make] = (brandCounts[car.Make] || 0) + 1;
  });
  const barChartData = {
    labels: Object.keys(brandCounts),
    datasets: [{
      label: 'Vehicles in Stock',
      data: Object.values(brandCounts),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const bodyTypeCounts = {};
  filteredInventory.forEach(car => {
    const type = car.Body_Type || "Unknown"; 
    bodyTypeCounts[type] = (bodyTypeCounts[type] || 0) + 1;
  });
  const doughnutData = {
    labels: Object.keys(bodyTypeCounts),
    datasets: [{
      data: Object.values(bodyTypeCounts),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      borderWidth: 1,
    }]
  };

  const scatterData = {
    datasets: [{
      label: 'Depreciation (Mileage vs Price)',
      data: filteredInventory.map(car => ({ x: car.Mileage, y: car.Selling_Price })),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
    }]
  };
  const scatterOptions = {
    responsive: true,
    scales: { x: { title: { display: true, text: 'Mileage' } }, y: { title: { display: true, text: 'Selling Price ($)' } } },
    plugins: { legend: { display: false } }
  };

  // --- INSIGHTS CHARTS GENERATION ---
  const createSingleDatasetChart = (labels, data, colors, label = 'Average Value') => ({
    labels,
    datasets: [{
      label,
      data,
      backgroundColor: colors,
      borderWidth: 1,
    }]
  });

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>Advanced Automobile Analytics</h1>
      
      {/* Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'dashboard' ? '#2196F3' : '#ddd', color: activeTab === 'dashboard' ? '#fff' : '#333', border: 'none', borderRadius: '5px' }}>
          Visual Dashboard
        </button>
        <button onClick={() => setActiveTab('data')} style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'data' ? '#2196F3' : '#ddd', color: activeTab === 'data' ? '#fff' : '#333', border: 'none', borderRadius: '5px' }}>
          Raw Database
        </button>
        <button onClick={() => setActiveTab('insights')} style={{ padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: activeTab === 'insights' ? '#2196F3' : '#ddd', color: activeTab === 'insights' ? '#fff' : '#333', border: 'none', borderRadius: '5px' }}>
          Key Insights (10 Qs)
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '18px' }}>Downloading data from server...</p>
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* TAB 1: VISUAL DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Filter Inventory by Brand:</label>
                <select value={selectedMake} onChange={(e) => setSelectedMake(e.target.value)} style={{ padding: '8px', fontSize: '16px', borderRadius: '4px', cursor: 'pointer' }}>
                  {uniqueMakes.map(make => <option key={make} value={make}>{make}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#555' }}>Inventory by Brand</h3>
                  <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#555' }}>Body Type Breakdown</h3>
                  <div style={{ width: '80%', margin: '0 auto' }}>
                     <Doughnut data={doughnutData} />
                  </div>
                </div>
                <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#555' }}>Mileage vs. Price</h3>
                  <Scatter data={scatterData} options={scatterOptions} />
                </div>
              </div>
            </>
          )}

          {/* TAB 2: RAW DATABASE */}
          {activeTab === 'data' && (
            <>
              {advisorMessage && (
                <div style={{ backgroundColor: '#e7f3fe', borderLeft: '6px solid #2196F3', padding: '15px', marginBottom: '20px', borderRadius: '4px', fontSize: '16px' }}>
                  <strong>AI Business Advisor: </strong> {advisorMessage}
                </div>
              )}
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#555' }}>Raw Data Table ({filteredInventory.length} Total Vehicles)</h3>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '20px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Make</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Model</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Year</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Mileage</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Price</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((car, index) => (
                      <tr key={index} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(car)} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{car.Make}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{car.Model}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{car.Year}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{car.Mileage}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>${car.Selling_Price}</td>
                        <td style={{ padding: '10px', borderBottom: '1px solid #eee', color: '#2196F3', fontWeight: 'bold' }}>Analyze</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ padding: '10px 15px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', backgroundColor: currentPage === 1 ? '#ddd' : '#2196F3', color: '#fff', border: 'none', borderRadius: '4px' }}>Previous</button>
                  <span style={{ fontSize: '14px', color: '#555' }}>Page {currentPage} of {totalPages === 0 ? 1 : totalPages}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} style={{ padding: '10px 15px', cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer', backgroundColor: (currentPage === totalPages || totalPages === 0) ? '#ddd' : '#2196F3', color: '#fff', border: 'none', borderRadius: '4px' }}>Next</button>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: KEY INSIGHTS (ALL 10 DATA ANALYST QUESTIONS) */}
          {activeTab === 'insights' && insights && (
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>Market Analysis & Key Insights (10 Core Questions)</h2>
              
              {/* Q1: Age Impact */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q1: How does a car's age affect its Selling Price?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Calculates depreciation over time.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> Newer cars (2021+) average <strong>${insights.newer_price?.toLocaleString()}</strong> vs. older cars (2014 or earlier) at <strong>${insights.older_price?.toLocaleString()}</strong>, showing an average value drop of <strong>${insights.age_drop?.toLocaleString()}</strong>.
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Bar data={createSingleDatasetChart(['Newer (2021+)', 'Older (<=2014)'], [insights.newer_price, insights.older_price], ['#4BC0C0', '#FF6384'])} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>

              {/* Q2: Mileage Impact */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q2: Does higher Mileage mean a lower price?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Quantifies financial penalty of wear and tear.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> Low mileage cars (&lt;30k) average <strong>${insights.low_mile_price?.toLocaleString()}</strong>, whereas high mileage (&gt;100k) average <strong>${insights.high_mile_price?.toLocaleString()}</strong>—a drop of <strong>${insights.mileage_drop?.toLocaleString()}</strong>.
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Bar data={createSingleDatasetChart(['Low Mile (<30k)', 'High Mile (>100k)'], [insights.low_mile_price, insights.high_mile_price], ['#36A2EB', '#FF9F40'])} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>

              {/* Q3: Accident History */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q3: How much does an Accident History drop the selling price?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Evaluates exact crash depreciation penalty.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> Clean vehicles sell for <strong>${insights.no_accident_price?.toLocaleString()}</strong> on average, while cars with accidents drop to <strong>${insights.accident_price?.toLocaleString()}</strong> (a <strong>${insights.accident_penalty?.toLocaleString()}</strong> penalty).
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Bar data={createSingleDatasetChart(['No Accidents', 'Accident History'], [insights.no_accident_price, insights.accident_price], ['#2ECC71', '#E74C3C'])} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>

              {/* Q4: Service History */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q4: Do buyers pay more for a "Full Service History"?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Tests if maintenance records command a pricing premium.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> Full service cars average <strong>${insights.full_service_price?.toLocaleString()}</strong> versus <strong>${insights.no_service_price?.toLocaleString()}</strong> for no service, giving a <strong>${insights.service_premium?.toLocaleString()}</strong> premium.
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Bar data={createSingleDatasetChart(['Full Service', 'No Service'], [insights.full_service_price, insights.no_service_price], ['#9B59B6', '#34495E'])} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>

              {/* Q5: Multiple Owners */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q5: Does having multiple previous Owners lower value?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Checks buyer trust for single vs multi-owner vehicles.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> Single-owner cars command <strong>${insights.one_owner_price?.toLocaleString()}</strong>, whereas 4+ owner cars drop significantly to <strong>${insights.multi_owner_price?.toLocaleString()}</strong>.
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <Bar data={createSingleDatasetChart(['1 Owner', '4+ Owners'], [insights.one_owner_price, insights.multi_owner_price], ['#1ABC9C', '#F39C12'])} options={{ plugins: { legend: { display: false } } }} />
                </div>
              </div>

              {/* Q6: Fuel Efficiency by Fuel Type */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q6: Which Fuel Type gives the best Fuel Efficiency?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Identifies long-term fuel savings per engine type.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> Electric vehicles lead with <strong>101.6 MPG equivalent</strong>, followed by Hybrids (43.7 MPG), Petrol (30.8 MPG), and Diesel (30.4 MPG).
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {insights.fuel_eff && (
                    <Bar data={createSingleDatasetChart(Object.keys(insights.fuel_eff), Object.values(insights.fuel_eff), ['#3498DB', '#2ECC71', '#F1C40F', '#E67E22'], 'MPG')} options={{ plugins: { legend: { display: false } } }} />
                  )}
                </div>
              </div>

              {/* Q7: Horsepower vs Price */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q7: Do higher Horsepower engines sell for more?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Tests correlation between performance features and price.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> High HP vehicles average <strong>${insights.hp_price?.['High HP']?.toLocaleString()}</strong>, outperforming Low HP models (<strong>${insights.hp_price?.['Low HP']?.toLocaleString()}</strong>).
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {insights.hp_price && (
                    <Bar data={createSingleDatasetChart(Object.keys(insights.hp_price), Object.values(insights.hp_price), ['#BDC3C7', '#95A5A6', '#7F8C8D'])} options={{ plugins: { legend: { display: false } } }} />
                  )}
                </div>
              </div>

              {/* Q8: Popularity and Price by Body Type */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q8: Which Body Type is most common and highest priced?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Guides inventory purchasing strategy.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> SUVs dominate market share (2,703 units) and hold top value (<strong>${insights.body_prices?.['SUV']?.toLocaleString()}</strong> avg price), whereas Hatchbacks average <strong>${insights.body_prices?.['Hatchback']?.toLocaleString()}</strong>.
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {insights.body_prices && (
                    <Bar data={createSingleDatasetChart(Object.keys(insights.body_prices), Object.values(insights.body_prices), ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'])} options={{ plugins: { legend: { display: false } } }} />
                  )}
                </div>
              </div>

              {/* Q9: Location Price Differences */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q9: Are cars more expensive in certain Locations?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Reveals regional market pricing variation.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> GA ($13,143) and OH ($13,117) have the highest selling averages, whereas PA ($11,580) and NC ($11,643) offer lower price entry points.
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {insights.location_prices && (
                    <Bar data={createSingleDatasetChart(Object.keys(insights.location_prices), Object.values(insights.location_prices), '#34495E')} options={{ plugins: { legend: { display: false } } }} />
                  )}
                </div>
              </div>

              {/* Q10: Color Pricing Trends */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fcfcfc', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 400px' }}>
                  <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Q10: Do certain Colors sell for higher prices?</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#555' }}><strong>Why ask this?</strong> Examines color popularity vs resale value.</p>
                  <div style={{ backgroundColor: '#e7f3fe', padding: '12px', borderRadius: '4px', fontSize: '16px', marginTop: '15px' }}>
                    <strong>Conclusion:</strong> Black vehicles lead average selling prices at <strong>$13,176</strong>, whereas Gray models average slightly lower at <strong>$11,346</strong>.
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  {insights.color_prices && (
                    <Bar data={createSingleDatasetChart(Object.keys(insights.color_prices), Object.values(insights.color_prices), ['#000000', '#3498DB', '#795548', '#95A5A6', '#2ECC71', '#E74C3C', '#BDC3C7', '#7F8C8D', '#ECF0F1'])} options={{ plugins: { legend: { display: false } } }} />
                  )}
                </div>
              </div>

            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

export default App;