# EduNiti AI Recommendation Engine

This is the AI-powered recommendation engine for EduNiti that provides personalized career and education recommendations based on user profiles, quiz responses, and preferences.

## Features

- **Stream Recommendations**: Suggests suitable academic streams based on interests and aptitude
- **Career Pathway Analysis**: Recommends career paths aligned with user strengths
- **College Matching**: Suggests colleges based on location, academic profile, and preferences
- **Interest Analysis**: Categorizes and scores user interests for better recommendations
- **Confidence Scoring**: Provides confidence levels for each recommendation

## API Endpoints

### Core Endpoints

- `POST /recommendations` - Get personalized recommendations
- `GET /career-pathways` - Get all available career pathways
- `GET /colleges` - Get all available colleges
- `POST /analyze-interests` - Analyze user interests

### Utility Endpoints

- `GET /` - API information
- `GET /health` - Health check

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Usage Example

```python
import requests

# Get stream recommendations
response = requests.post("http://localhost:8000/recommendations", json={
    "user_profile": {
        "user_id": "123",
        "first_name": "John",
        "last_name": "Doe",
        "class_level": "12",
        "stream": None,
        "location": {"state": "Delhi", "city": "New Delhi"},
        "interests": ["programming", "mathematics", "problem solving"],
        "quiz_responses": []
    },
    "recommendation_type": "stream"
})

print(response.json())
```

## Recommendation Types

1. **stream**: Academic stream recommendations (Science, Commerce, Arts, etc.)
2. **career**: Career pathway recommendations
3. **college**: College recommendations based on location and profile

## Algorithm

The recommendation engine uses:

1. **Interest Analysis**: TF-IDF vectorization and cosine similarity
2. **Scoring System**: Weighted scoring based on user preferences
3. **Location-based Filtering**: Geographic proximity for college recommendations
4. **Confidence Scoring**: Statistical confidence in recommendations

## Future Enhancements

- Machine learning model training on user data
- Real-time learning from user feedback
- Integration with external career databases
- Advanced NLP for interest analysis
- Collaborative filtering for similar user recommendations
