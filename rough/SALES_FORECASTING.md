# 📈 Sales Forecasting System

A machine learning application to predict sales revenue based on advertising spend using linear regression.

## 🎯 Business Use Case

**Problem:** Companies need to predict sales revenue based on advertising budget to optimize marketing spend.

**Solution:** This system uses historical data of advertising spend and corresponding sales to build a predictive model.

## 📊 Sample Data (Included)

**Training Data:**
- Advertising Spend: ₹10k, ₹20k, ₹30k, ₹40k, ₹50k, ₹60k, ₹70k, ₹80k
- Sales Revenue: ₹25L, ₹45L, ₹65L, ₹85L, ₹105L, ₹125L, ₹145L, ₹165L

**Pattern:** For every ₹10,000 increase in advertising, sales increase by approximately ₹20 lakhs.

## 🚀 Quick Start

```powershell
# Start the application
docker-compose up -d --build

# Access the web interface
# Open browser: http://localhost:8000/app
```

## 💡 How to Use

1. **Train the Model:**
   - Use the pre-filled data or enter your own historical data
   - Click "Train Model"
   - View model accuracy (R² score) and equation

2. **Forecast Sales:**
   - Enter proposed advertising budgets (e.g., ₹90k, ₹100k, ₹120k)
   - Click "Forecast Sales"
   - Get predicted sales revenue

3. **Analyze Results:**
   - View visualization with training data and predictions
   - Check R² score (closer to 1.0 = better accuracy)
   - Use the model equation for quick calculations

## 📈 Real-World Applications

### Marketing Budget Planning
- Input: Planned advertising budget
- Output: Expected sales revenue
- Decision: ROI analysis and budget allocation

### Performance Analysis
- Compare actual sales vs predicted sales
- Identify underperforming campaigns
- Optimize marketing channels

### Business Forecasting
- Quarterly/yearly sales projections
- Revenue planning
- Growth strategy development

## 🔧 API Usage

### Train with Your Data
```bash
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{
    "x": [10, 20, 30, 40, 50, 60, 70, 80],
    "y": [25, 45, 65, 85, 105, 125, 145, 165]
  }'
```

### Forecast Sales
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"x": [90, 100, 120]}'
```

## 📊 Understanding the Output

**R² Score (Coefficient of Determination):**
- 1.0 = Perfect fit
- 0.9+ = Excellent
- 0.7-0.9 = Good
- <0.7 = May need more data or different model

**MSE (Mean Squared Error):**
- Lower is better
- Measures average prediction error

**Model Equation:**
```
Sales Revenue = (Coefficient × Ad Spend) + Intercept
```

## 🎓 Example Scenarios

### Scenario 1: New Product Launch
```
Historical Data:
- Month 1: ₹50k ads → ₹105L sales
- Month 2: ₹60k ads → ₹125L sales
- Month 3: ₹70k ads → ₹145L sales

Question: If we spend ₹100k on ads, what sales can we expect?
Answer: Train model and forecast!
```

### Scenario 2: Budget Optimization
```
Goal: Achieve ₹200L in sales
Question: How much should we spend on advertising?

Use model equation to reverse calculate:
Ad Spend = (Target Sales - Intercept) / Coefficient
```

## 📁 Your Own Data

Replace the sample data with your actual:
- **X values:** Advertising spend (any currency/unit)
- **Y values:** Sales revenue (any currency/unit)
- **Format:** Comma-separated numbers

Example from Excel/CSV:
1. Copy your data columns
2. Paste as comma-separated (10, 20, 30...)
3. Train the model

## 🔄 Continuous Improvement

**Best Practices:**
1. Update model monthly with new data
2. Include at least 10-15 data points
3. Remove outliers or unusual periods
4. Track prediction accuracy over time

## 📞 Business Insights

**Key Metrics:**
- Customer Acquisition Cost (CAC)
- Return on Ad Spend (ROAS)
- Break-even point
- Optimal budget allocation

**Formula:**
```
ROAS = Predicted Sales / Ad Spend
```

## 🛠️ Technical Stack

- **Backend:** FastAPI (Python)
- **ML Model:** Linear Regression (scikit-learn)
- **Frontend:** HTML5, CSS3, JavaScript
- **Deployment:** Docker, Docker Compose
- **CI/CD:** GitHub Actions

## 📊 Data Requirements

**Minimum:**
- 2 data points (not recommended)

**Recommended:**
- 10+ data points for reliable predictions
- Consistent time periods
- Clean data (no missing values)

## 🎯 Limitations

Linear regression assumes:
- Linear relationship between variables
- No external factors affecting sales
- Consistent market conditions

For more complex scenarios with multiple variables (social media, seasonality, competition), consider multiple regression or other ML models.

## 🚀 Future Enhancements

- Multiple variable support (TV, Radio, Online ads)
- Seasonal adjustments
- Confidence intervals
- Data upload from CSV/Excel
- Historical model comparison
- A/B test analysis

---

**Built for Business Intelligence and Data-Driven Decision Making**
