# EduNiti Testing Guide

This guide covers testing strategies and procedures for the EduNiti platform.

## Testing Strategy

### 1. Unit Testing
- Individual component testing
- Function and method testing
- Database query testing
- API endpoint testing

### 2. Integration Testing
- Component integration
- API integration
- Database integration
- Third-party service integration

### 3. End-to-End Testing
- User journey testing
- Cross-browser testing
- Mobile app testing
- Performance testing

## Frontend Testing (Next.js)

### Setup

```bash
cd apps/web
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Test Configuration

Create `jest.config.js`:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Example Component Test

```javascript
// src/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Authentication Testing

```javascript
// src/app/auth/login/page.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@eduniti/database'
import LoginPage from './page'

jest.mock('@eduniti/database')

describe('Login Page', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      signOut: jest.fn()
    })
  })

  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    render(<LoginPage />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      // Assert successful login
    })
  })
})
```

## Backend Testing (Supabase)

### Database Testing

```javascript
// tests/database.test.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

describe('Database Operations', () => {
  it('should create a new profile', async () => {
    const profileData = {
      id: 'test-user-id',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('should fetch colleges with filters', async () => {
    const { data, error } = await supabase
      .from('colleges')
      .select('*')
      .eq('type', 'government')
      .limit(10)

    expect(error).toBeNull()
    expect(data).toHaveLength(10)
  })
})
```

## AI Engine Testing (Python)

### Setup

```bash
cd apps/ai-engine
pip install pytest pytest-asyncio httpx
```

### API Testing

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_recommendations():
    request_data = {
        "user_profile": {
            "user_id": "test-user",
            "first_name": "Test",
            "last_name": "User",
            "class_level": "12",
            "stream": None,
            "location": {"state": "Delhi", "city": "New Delhi"},
            "interests": ["programming", "mathematics"],
            "quiz_responses": []
        },
        "recommendation_type": "stream"
    }
    
    response = client.post("/recommendations", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "recommendations" in data
    assert "confidence_score" in data
    assert len(data["recommendations"]) > 0

def test_interest_analysis():
    interests = ["programming", "mathematics", "science"]
    response = client.post("/analyze-interests", json=interests)
    
    assert response.status_code == 200
    data = response.json()
    assert "interest_scores" in data
    assert "technical" in data["interest_scores"]
```

### Recommendation Engine Testing

```python
# tests/test_recommendation_engine.py
import pytest
from main import RecommendationEngine

@pytest.fixture
def engine():
    return RecommendationEngine()

@pytest.fixture
def sample_user_profile():
    return {
        "user_id": "test-user",
        "first_name": "Test",
        "last_name": "User",
        "class_level": "12",
        "stream": None,
        "location": {"state": "Delhi", "city": "New Delhi"},
        "interests": ["programming", "mathematics", "problem solving"],
        "quiz_responses": []
    }

def test_stream_recommendation(engine, sample_user_profile):
    recommendations = engine.get_stream_recommendation(sample_user_profile)
    
    assert len(recommendations) > 0
    assert all("stream" in rec for rec in recommendations)
    assert all("confidence_score" in rec for rec in recommendations)

def test_career_recommendations(engine, sample_user_profile):
    recommendations = engine.get_career_recommendations(sample_user_profile)
    
    assert len(recommendations) > 0
    assert all("title" in rec for rec in recommendations)
    assert all("match_score" in rec for rec in recommendations)

def test_interest_analysis(engine):
    interests = ["programming", "mathematics", "art"]
    scores = engine.analyze_user_interests(interests)
    
    assert "technical" in scores
    assert "creative" in scores
    assert scores["technical"] > scores["creative"]  # programming + math > art
```

## Mobile App Testing (React Native)

### Setup

```bash
cd apps/mobile
npm install --save-dev @testing-library/react-native jest
```

### Component Testing

```javascript
// App.test.tsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import App from './App'

describe('EduNiti Mobile App', () => {
  it('renders the main screen', () => {
    render(<App />)
    expect(screen.getByText('Your Path. Your Future.')).toBeTruthy()
  })

  it('displays quick action cards', () => {
    render(<App />)
    expect(screen.getByText('Aptitude Quiz')).toBeTruthy()
    expect(screen.getByText('Find Colleges')).toBeTruthy()
  })

  it('navigates to quiz when tapped', () => {
    render(<App />)
    const quizCard = screen.getByText('Aptitude Quiz')
    fireEvent.press(quizCard)
    // Assert navigation
  })
})
```

## End-to-End Testing

### Playwright Setup

```bash
npm install --save-dev @playwright/test
```

### E2E Test Example

```javascript
// tests/e2e/user-journey.spec.js
import { test, expect } from '@playwright/test'

test.describe('User Journey', () => {
  test('complete user onboarding and quiz', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:3000')
    
    // Sign up
    await page.click('text=Get Started')
    await page.fill('[name="firstName"]', 'Test')
    await page.fill('[name="lastName"]', 'User')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Complete profile
    await page.fill('[name="dateOfBirth"]', '2000-01-01')
    await page.selectOption('[name="gender"]', 'male')
    await page.selectOption('[name="classLevel"]', '12')
    await page.selectOption('[name="stream"]', 'science')
    await page.click('text=Complete Profile')
    
    // Start quiz
    await page.click('text=Start Assessment')
    await page.click('text=Start Quiz')
    
    // Answer questions
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="answer-0"]')
      await page.click('text=Next')
    }
    
    // Complete quiz
    await page.click('text=Complete Quiz')
    
    // Verify results
    await expect(page.locator('text=Quiz Completed!')).toBeVisible()
  })
})
```

## Performance Testing

### Load Testing with Artillery

```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 20
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "User Registration"
    weight: 30
    flow:
      - post:
          url: "/api/auth/signup"
          json:
            email: "user{{ $randomInt(1, 1000) }}@example.com"
            password: "password123"
  
  - name: "College Search"
    weight: 50
    flow:
      - get:
          url: "/api/colleges"
          qs:
            state: "Delhi"
            type: "government"
  
  - name: "Quiz Submission"
    weight: 20
    flow:
      - post:
          url: "/api/quiz/submit"
          json:
            responses: "{{ $randomArray() }}"
```

## Security Testing

### Authentication Testing

```javascript
// tests/security/auth.test.js
describe('Authentication Security', () => {
  it('should reject invalid credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })
    })
    
    expect(response.status).toBe(401)
  })

  it('should enforce rate limiting', async () => {
    const promises = Array(10).fill().map(() => 
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    )
    
    const responses = await Promise.all(promises)
    const rateLimited = responses.some(r => r.status === 429)
    expect(rateLimited).toBe(true)
  })
})
```

## Test Automation

### GitHub Actions CI/CD

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd apps/web && npm ci
      - run: cd apps/web && npm run test
      - run: cd apps/web && npm run build

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: cd apps/ai-engine && pip install -r requirements.txt
      - run: cd apps/ai-engine && pytest

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## Test Data Management

### Test Database Setup

```javascript
// tests/setup/test-db.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.TEST_SUPABASE_URL,
  process.env.TEST_SUPABASE_ANON_KEY
)

export const setupTestData = async () => {
  // Insert test colleges
  await supabase.from('colleges').insert([
    {
      id: 'test-college-1',
      name: 'Test Government College',
      type: 'government',
      location: { state: 'Delhi', city: 'New Delhi' }
    }
  ])
  
  // Insert test questions
  await supabase.from('quiz_questions').insert([
    {
      id: 'test-question-1',
      question_text: 'Test question?',
      question_type: 'interest',
      category: 'general',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
    }
  ])
}

export const cleanupTestData = async () => {
  await supabase.from('quiz_responses').delete().neq('id', '')
  await supabase.from('profiles').delete().neq('id', '')
  await supabase.from('colleges').delete().eq('id', 'test-college-1')
  await supabase.from('quiz_questions').delete().eq('id', 'test-question-1')
}
```

## Running Tests

### Frontend Tests
```bash
cd apps/web
npm run test
npm run test:coverage
```

### Backend Tests
```bash
cd apps/ai-engine
pytest
pytest --cov=main
```

### Mobile Tests
```bash
cd apps/mobile
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### All Tests
```bash
npm run test:all
```

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: Critical user journeys
- **Performance Tests**: Load testing for APIs
- **Security Tests**: Authentication and authorization

This comprehensive testing strategy ensures the EduNiti platform is robust, reliable, and secure across all components.

