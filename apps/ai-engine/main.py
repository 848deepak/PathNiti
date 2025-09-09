"""
EduNiti AI Recommendation Engine
Provides personalized career and education recommendations based on user data
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import json
import os
from datetime import datetime

app = FastAPI(
    title="EduNiti AI Engine",
    description="AI-powered career and education recommendation engine",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class QuizResponse(BaseModel):
    question_id: str
    selected_answer: int
    time_taken: int
    is_correct: Optional[bool] = None

class UserProfile(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    class_level: str
    stream: Optional[str] = None
    location: Dict[str, str]
    interests: List[str]
    quiz_responses: List[QuizResponse]

class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    recommendation_type: str  # "career", "college", "scholarship", "stream"

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    confidence_score: float
    reasoning: str
    generated_at: datetime

# Sample data for demonstration
SAMPLE_CAREER_PATHWAYS = [
    {
        "id": "1",
        "title": "Software Engineer",
        "stream": "engineering",
        "education_requirements": ["B.Tech Computer Science", "M.Tech (Optional)"],
        "skills_required": ["Programming", "Problem Solving", "Mathematics"],
        "job_opportunities": ["Software Developer", "System Analyst", "Tech Lead"],
        "salary_range": {"min": 400000, "max": 2000000, "currency": "INR"},
        "growth_prospects": "High demand in IT sector with excellent growth opportunities",
        "related_exams": ["GATE", "JEE Advanced", "Company-specific tests"]
    },
    {
        "id": "2",
        "title": "Doctor",
        "stream": "medical",
        "education_requirements": ["MBBS", "MD/MS (Specialization)"],
        "skills_required": ["Medical Knowledge", "Empathy", "Problem Solving"],
        "job_opportunities": ["General Practitioner", "Specialist", "Surgeon"],
        "salary_range": {"min": 600000, "max": 3000000, "currency": "INR"},
        "growth_prospects": "Stable career with high social respect and good earning potential",
        "related_exams": ["NEET", "AIIMS", "JIPMER"]
    },
    {
        "id": "3",
        "title": "Data Scientist",
        "stream": "science",
        "education_requirements": ["B.Sc Mathematics/Statistics", "M.Sc/M.Tech Data Science"],
        "skills_required": ["Statistics", "Programming", "Machine Learning"],
        "job_opportunities": ["Data Analyst", "ML Engineer", "Research Scientist"],
        "salary_range": {"min": 500000, "max": 2500000, "currency": "INR"},
        "growth_prospects": "High demand in AI/ML field with excellent career prospects",
        "related_exams": ["GATE", "GRE", "Company-specific tests"]
    },
    {
        "id": "4",
        "title": "Civil Engineer",
        "stream": "engineering",
        "education_requirements": ["B.Tech Civil Engineering", "M.Tech (Optional)"],
        "skills_required": ["Mathematics", "Physics", "Design Skills"],
        "job_opportunities": ["Site Engineer", "Project Manager", "Consultant"],
        "salary_range": {"min": 300000, "max": 1500000, "currency": "INR"},
        "growth_prospects": "Good opportunities in infrastructure development",
        "related_exams": ["GATE", "JEE Advanced", "State Engineering Exams"]
    },
    {
        "id": "5",
        "title": "Teacher/Professor",
        "stream": "arts",
        "education_requirements": ["B.Ed", "M.A/M.Sc", "Ph.D (For Professor)"],
        "skills_required": ["Subject Knowledge", "Communication", "Patience"],
        "job_opportunities": ["School Teacher", "College Professor", "Educational Consultant"],
        "salary_range": {"min": 200000, "max": 1200000, "currency": "INR"},
        "growth_prospects": "Stable career with good work-life balance",
        "related_exams": ["CTET", "NET", "State Teacher Exams"]
    }
]

SAMPLE_COLLEGES = [
    {
        "id": "1",
        "name": "Delhi University",
        "type": "government",
        "location": {"state": "Delhi", "city": "New Delhi"},
        "programs": ["Arts", "Science", "Commerce"],
        "cut_off_data": {"arts": 85, "science": 90, "commerce": 88},
        "fees": {"annual": 15000, "currency": "INR"},
        "facilities": ["Hostel", "Library", "Sports", "Labs"]
    },
    {
        "id": "2",
        "name": "IIT Delhi",
        "type": "government",
        "location": {"state": "Delhi", "city": "New Delhi"},
        "programs": ["Engineering", "Technology"],
        "cut_off_data": {"engineering": 95},
        "fees": {"annual": 200000, "currency": "INR"},
        "facilities": ["Hostel", "Library", "Sports", "Labs", "Research Centers"]
    }
]

# Initialize recommendation engine
class RecommendationEngine:
    def __init__(self):
        self.career_pathways = SAMPLE_CAREER_PATHWAYS
        self.colleges = SAMPLE_COLLEGES
        self.vectorizer = TfidfVectorizer(stop_words='english')
        
    def analyze_user_interests(self, interests: List[str]) -> Dict[str, float]:
        """Analyze user interests and return interest scores"""
        interest_categories = {
            "technical": ["programming", "mathematics", "science", "technology", "computer"],
            "creative": ["art", "design", "music", "writing", "photography"],
            "social": ["leadership", "communication", "public speaking", "teamwork"],
            "analytical": ["research", "problem solving", "data analysis", "statistics"],
            "practical": ["hands-on", "mechanical", "construction", "engineering"]
        }
        
        scores = {}
        for category, keywords in interest_categories.items():
            score = sum(1 for interest in interests if any(keyword in interest.lower() for keyword in keywords))
            scores[category] = score / len(interests) if interests else 0
            
        return scores
    
    def get_stream_recommendation(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Recommend suitable streams based on user profile"""
        interest_scores = self.analyze_user_interests(user_profile.interests)
        
        stream_scores = {
            "science": interest_scores.get("technical", 0) + interest_scores.get("analytical", 0),
            "engineering": interest_scores.get("technical", 0) + interest_scores.get("practical", 0),
            "medical": interest_scores.get("analytical", 0) + interest_scores.get("social", 0),
            "arts": interest_scores.get("creative", 0) + interest_scores.get("social", 0),
            "commerce": interest_scores.get("analytical", 0) + interest_scores.get("social", 0)
        }
        
        # Sort streams by score
        sorted_streams = sorted(stream_scores.items(), key=lambda x: x[1], reverse=True)
        
        recommendations = []
        for stream, score in sorted_streams[:3]:
            recommendations.append({
                "stream": stream,
                "confidence_score": score,
                "reasoning": f"Based on your interests in {', '.join(user_profile.interests[:3])}, {stream} stream aligns well with your profile."
            })
            
        return recommendations
    
    def get_career_recommendations(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Get career pathway recommendations"""
        stream_rec = self.get_stream_recommendation(user_profile)
        recommended_stream = stream_rec[0]["stream"] if stream_rec else "science"
        
        # Filter career pathways by recommended stream
        relevant_careers = [career for career in self.career_pathways if career["stream"] == recommended_stream]
        
        # Score careers based on user interests
        scored_careers = []
        for career in relevant_careers:
            score = 0
            for skill in career["skills_required"]:
                if any(interest.lower() in skill.lower() for interest in user_profile.interests):
                    score += 1
            
            scored_careers.append({
                **career,
                "match_score": score / len(career["skills_required"]) if career["skills_required"] else 0
            })
        
        # Sort by match score
        scored_careers.sort(key=lambda x: x["match_score"], reverse=True)
        
        return scored_careers[:3]
    
    def get_college_recommendations(self, user_profile: UserProfile) -> List[Dict[str, Any]]:
        """Get college recommendations based on location and stream"""
        user_state = user_profile.location.get("state", "")
        user_city = user_profile.location.get("city", "")
        
        # Filter colleges by location and stream
        relevant_colleges = []
        for college in self.colleges:
            if (college["location"]["state"] == user_state or 
                college["location"]["city"] == user_city):
                relevant_colleges.append(college)
        
        # If no local colleges, recommend top colleges
        if not relevant_colleges:
            relevant_colleges = self.colleges[:3]
        
        return relevant_colleges
    
    def generate_recommendations(self, request: RecommendationRequest) -> RecommendationResponse:
        """Generate recommendations based on request type"""
        user_profile = request.user_profile
        
        if request.recommendation_type == "stream":
            recommendations = self.get_stream_recommendation(user_profile)
            reasoning = f"Based on your interests and class level ({user_profile.class_level}), we recommend these streams."
            
        elif request.recommendation_type == "career":
            recommendations = self.get_career_recommendations(user_profile)
            reasoning = f"Based on your profile and interests, these career paths align with your strengths."
            
        elif request.recommendation_type == "college":
            recommendations = self.get_college_recommendations(user_profile)
            reasoning = f"Based on your location and academic profile, these colleges are suitable for you."
            
        else:
            raise HTTPException(status_code=400, detail="Invalid recommendation type")
        
        # Calculate overall confidence score
        confidence_score = 0.8 if recommendations else 0.3
        
        return RecommendationResponse(
            recommendations=recommendations,
            confidence_score=confidence_score,
            reasoning=reasoning,
            generated_at=datetime.now()
        )

# Initialize recommendation engine
recommendation_engine = RecommendationEngine()

@app.get("/")
async def root():
    return {"message": "EduNiti AI Recommendation Engine", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get personalized recommendations"""
    try:
        recommendations = recommendation_engine.generate_recommendations(request)
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/career-pathways")
async def get_career_pathways():
    """Get all available career pathways"""
    return {"career_pathways": SAMPLE_CAREER_PATHWAYS}

@app.get("/colleges")
async def get_colleges():
    """Get all available colleges"""
    return {"colleges": SAMPLE_COLLEGES}

@app.post("/analyze-interests")
async def analyze_interests(interests: List[str]):
    """Analyze user interests and return categorized scores"""
    engine = RecommendationEngine()
    scores = engine.analyze_user_interests(interests)
    return {"interest_scores": scores}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
