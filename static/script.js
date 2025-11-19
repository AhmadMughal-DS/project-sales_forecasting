// API Base URL
const API_URL = window.location.origin;

// Global variables
let trainedModel = null;
let trainingData = { x: [], y: [] };

// Check model status on page load
window.addEventListener('DOMContentLoaded', () => {
    checkModelStatus();
    initializeChart();
});

// Check if model is trained
async function checkModelStatus() {
    try {
        const response = await fetch(`${API_URL}/model/status`);
        const data = await response.json();
        
        const statusElement = document.getElementById('modelStatus');
        if (data.trained || data.model_exists) {
            statusElement.textContent = '✅ Model Status: Trained';
            statusElement.style.color = '#155724';
        } else {
            statusElement.textContent = '❌ Model Status: Not Trained';
            statusElement.style.color = '#721c24';
        }
    } catch (error) {
        console.error('Error checking model status:', error);
    }
}

// Parse comma-separated values
function parseValues(input) {
    return input.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
}

// Train the model
async function trainModel() {
    const xInput = document.getElementById('trainX').value;
    const yInput = document.getElementById('trainY').value;
    const resultDiv = document.getElementById('trainingResult');
    
    // Parse input values
    const xValues = parseValues(xInput);
    const yValues = parseValues(yInput);
    
    // Validation
    if (xValues.length === 0 || yValues.length === 0) {
        showResult(resultDiv, 'Please enter valid numbers', 'error');
        return;
    }
    
    if (xValues.length !== yValues.length) {
        showResult(resultDiv, 'X and Y must have the same number of values', 'error');
        return;
    }
    
    // Show loading
    showResult(resultDiv, 'Training model... <span class="loading"></span>', 'success');
    
    try {
        const response = await fetch(`${API_URL}/train`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                x: xValues,
                y: yValues
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Training failed');
        }
        
        const result = await response.json();
        trainedModel = result;
        trainingData = { x: xValues, y: yValues };
        
        // Display results
        const resultHTML = `
            <strong>✅ Model Trained Successfully!</strong>
            <div style="margin-top: 10px;">
                <strong>Coefficient:</strong> ${result.coefficients[0].toFixed(4)}<br>
                <strong>Intercept:</strong> ${result.intercept.toFixed(4)}<br>
                <strong>R² Score:</strong> ${result.r2_score.toFixed(4)}<br>
                <strong>MSE:</strong> ${result.mse.toFixed(4)}<br>
                <strong>Equation:</strong> y = ${result.coefficients[0].toFixed(4)}x + ${result.intercept.toFixed(4)}
            </div>
        `;
        
        showResult(resultDiv, resultHTML, 'success');
        checkModelStatus();
        
        // Update visualization
        drawChart(xValues, yValues, result);
        
    } catch (error) {
        showResult(resultDiv, `❌ Error: ${error.message}`, 'error');
    }
}

// Make predictions
async function makePrediction() {
    const xInput = document.getElementById('predictX').value;
    const resultDiv = document.getElementById('predictionResult');
    
    // Parse input values
    const xValues = parseValues(xInput);
    
    // Validation
    if (xValues.length === 0) {
        showResult(resultDiv, 'Please enter valid numbers', 'error');
        return;
    }
    
    // Show loading
    showResult(resultDiv, 'Making predictions... <span class="loading"></span>', 'success');
    
    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                x: xValues
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Prediction failed');
        }
        
        const result = await response.json();
        
        // Display predictions
        let resultHTML = '<strong>🎯 Sales Forecast:</strong><div style="margin-top: 10px;">';
        xValues.forEach((x, i) => {
            resultHTML += `₹${x}k ad spend → ₹${result.predictions[i].toFixed(2)}L revenue<br>`;
        });
        resultHTML += '</div>';
        
        showResult(resultDiv, resultHTML, 'success');
        
        // Add predictions to chart
        if (trainedModel) {
            drawChart(trainingData.x, trainingData.y, trainedModel, xValues, result.predictions);
        }
        
    } catch (error) {
        showResult(resultDiv, `❌ Error: ${error.message}`, 'error');
    }
}

// Show result message
function showResult(element, message, type) {
    element.innerHTML = message;
    element.className = `result-box ${type}`;
}

// Initialize chart canvas
function initializeChart() {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 400;
    
    // Draw initial empty chart
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Train the model to see visualization', canvas.width / 2, canvas.height / 2);
}

// Draw chart with data
function drawChart(xData, yData, modelInfo, predX = [], predY = []) {
    const canvas = document.getElementById('chartCanvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate bounds
    const allX = [...xData, ...predX];
    const allY = [...yData, ...predY];
    const minX = Math.min(...allX) - 1;
    const maxX = Math.max(...allX) + 1;
    const minY = Math.min(...allY) - 1;
    const maxY = Math.max(...allY) + 1;
    
    const padding = 50;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Helper function to convert data coordinates to canvas coordinates
    function toCanvasX(x) {
        return padding + ((x - minX) / (maxX - minX)) * chartWidth;
    }
    
    function toCanvasY(y) {
        return canvas.height - padding - ((y - minY) / (maxY - minY)) * chartHeight;
    }
    
    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Draw regression line
    if (modelInfo) {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const y1 = modelInfo.coefficients[0] * minX + modelInfo.intercept;
        const y2 = modelInfo.coefficients[0] * maxX + modelInfo.intercept;
        
        ctx.moveTo(toCanvasX(minX), toCanvasY(y1));
        ctx.lineTo(toCanvasX(maxX), toCanvasY(y2));
        ctx.stroke();
    }
    
    // Draw training data points
    ctx.fillStyle = '#11998e';
    xData.forEach((x, i) => {
        ctx.beginPath();
        ctx.arc(toCanvasX(x), toCanvasY(yData[i]), 6, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw prediction points
    if (predX.length > 0) {
        ctx.fillStyle = '#e74c3c';
        predX.forEach((x, i) => {
            ctx.beginPath();
            ctx.arc(toCanvasX(x), toCanvasY(predY[i]), 6, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Advertising Spend (₹k)', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Sales Revenue (₹L)', 0, 0);
    ctx.restore();
    
    // Legend
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#11998e';
    ctx.fillRect(canvas.width - 180, 20, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Training Data', canvas.width - 160, 32);
    
    if (predX.length > 0) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(canvas.width - 180, 40, 15, 15);
        ctx.fillStyle = '#333';
        ctx.fillText('Predictions', canvas.width - 160, 52);
    }
    
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 180, 67);
    ctx.lineTo(canvas.width - 165, 67);
    ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.fillText('Regression Line', canvas.width - 160, 72);
}
