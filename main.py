from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import os

app = FastAPI(title="Simple Regression API")

# Global model variable
model = None
model_trained = False

class TrainingData(BaseModel):
    x: List[float]
    y: List[float]

class PredictionInput(BaseModel):
    x: List[float]

class TrainingResponse(BaseModel):
    message: str
    r2_score: float
    mse: float
    coefficients: List[float]
    intercept: float

class PredictionResponse(BaseModel):
    predictions: List[float]

@app.get("/")
async def root():
    return {"message": "Regression Model API", "status": "running"}

@app.post("/train", response_model=TrainingResponse)
async def train_model(data: TrainingData):
    """
    Train a linear regression model with provided data
    """
    global model, model_trained
    
    try:
        # Validate input
        if len(data.x) != len(data.y):
            raise HTTPException(status_code=400, detail="X and Y must have the same length")
        
        if len(data.x) < 2:
            raise HTTPException(status_code=400, detail="Need at least 2 data points to train")
        
        # Prepare data
        X = np.array(data.x).reshape(-1, 1)
        y = np.array(data.y)
        
        # Train model
        model = LinearRegression()
        model.fit(X, y)
        
        # Calculate metrics
        predictions = model.predict(X)
        mse = mean_squared_error(y, predictions)
        r2 = r2_score(y, predictions)
        
        model_trained = True
        
        # Save model
        with open("model.pkl", "wb") as f:
            pickle.dump(model, f)
        
        return TrainingResponse(
            message="Model trained successfully",
            r2_score=float(r2),
            mse=float(mse),
            coefficients=model.coef_.tolist(),
            intercept=float(model.intercept_)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionInput):
    """
    Make predictions using the trained model
    """
    global model, model_trained
    
    if not model_trained:
        # Try to load saved model
        if os.path.exists("model.pkl"):
            with open("model.pkl", "rb") as f:
                model = pickle.load(f)
            model_trained = True
        else:
            raise HTTPException(status_code=400, detail="Model not trained yet. Please train the model first.")
    
    try:
        X = np.array(data.x).reshape(-1, 1)
        predictions = model.predict(X)
        
        return PredictionResponse(
            predictions=predictions.tolist()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model/status")
async def model_status():
    """
    Check if model is trained
    """
    return {
        "trained": model_trained,
        "model_exists": os.path.exists("model.pkl")
    }

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/app", response_class=HTMLResponse)
async def serve_app():
    """
    Serve the frontend application
    
    """
    with open("static/index.html", "r") as f:
        return f.read()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
