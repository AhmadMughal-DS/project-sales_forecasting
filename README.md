# 🤖 Simple Linear Regression ML API

A complete machine learning application with a FastAPI backend, interactive web frontend, and containerized deployment setup. Train and predict using linear regression models through a beautiful web interface.

## 📋 Features

- **FastAPI Backend**: RESTful API with endpoints for model training and predictions
- **Interactive Frontend**: Clean, responsive web interface built with vanilla HTML/CSS/JavaScript
- **Linear Regression**: Simple scikit-learn based regression model
- **Real-time Visualization**: Canvas-based chart showing training data, predictions, and regression line
- **Docker Support**: Full containerization with Docker and Docker Compose
- **CI/CD Pipeline**: GitHub Actions workflow for testing and building
- **Model Persistence**: Save and load trained models

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and run the application
docker-compose up --build

# Access the application at http://localhost:8000/app
```

### Using Docker

```bash
# Build the Docker image
docker build -t regression-ml-api .

# Run the container
docker run -p 8000:8000 regression-ml-api

# Access the application at http://localhost:8000/app
```

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
python main.py

# Or use uvicorn directly
uvicorn main:app --reload

# Access the application at http://localhost:8000/app
```

## 📁 Project Structure

```
.
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── .dockerignore          # Docker ignore file
├── static/
│   ├── index.html         # Frontend HTML
│   ├── style.css          # Styling
│   └── script.js          # Frontend JavaScript
├── .github/
│   └── workflows/
│       └── ci-cd.yml      # GitHub Actions pipeline
└── README.md              # This file
```

## 🎯 API Endpoints

### Root
- **GET** `/` - API status check

### Model Training
- **POST** `/train` - Train the regression model
  ```json
  {
    "x": [1, 2, 3, 4, 5],
    "y": [2, 4, 6, 8, 10]
  }
  ```

### Predictions
- **POST** `/predict` - Make predictions
  ```json
  {
    "x": [6, 7, 8]
  }
  ```

### Model Status
- **GET** `/model/status` - Check if model is trained

### Frontend
- **GET** `/app` - Access the web interface

## 💡 Usage Example

1. **Open the web interface** at `http://localhost:8000/app`

2. **Train the Model**:
   - Enter X values: `1, 2, 3, 4, 5`
   - Enter Y values: `2, 4, 6, 8, 10`
   - Click "Train Model"
   - View the results including R² score, MSE, and model equation

3. **Make Predictions**:
   - Enter X values: `6, 7, 8`
   - Click "Predict"
   - View predicted Y values

4. **Visualize Results**:
   - See training data (green dots)
   - View predictions (red dots)
   - Observe the regression line (purple)

## 🧪 API Testing with cURL

```bash
# Check API status
curl http://localhost:8000/

# Train the model
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{"x": [1, 2, 3, 4, 5], "y": [2, 4, 6, 8, 10]}'

# Make predictions
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"x": [6, 7, 8]}'

# Check model status
curl http://localhost:8000/model/status
```

## 🔧 Development

### Requirements
- Python 3.11+
- Docker (optional)
- Docker Compose (optional)

### Dependencies
- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **scikit-learn**: Machine learning library
- **NumPy**: Numerical computing
- **Pydantic**: Data validation

## 🐳 Docker Commands

```bash
# Build image
docker-compose build

# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up --build
```

## 🔄 CI/CD Pipeline

The GitHub Actions pipeline automatically:
1. **Tests**: Runs linting and tests on push/PR
2. **Builds**: Creates Docker image and tests it
3. **Deploys**: (Optional) Deploy step for production

## 📊 Model Details

The application uses **Linear Regression** from scikit-learn:
- **Algorithm**: Ordinary Least Squares
- **Equation**: `y = mx + b`
- **Metrics**: R² Score, Mean Squared Error (MSE)
- **Persistence**: Models saved as pickle files

## 🛠️ Configuration

### Environment Variables
```bash
# None required - all defaults work out of the box
```

### Port Configuration
- Default port: `8000`
- Change in `docker-compose.yml` or run command

## 📝 License

MIT License - Feel free to use this project for learning and development!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using FastAPI, scikit-learn, and Docker**
