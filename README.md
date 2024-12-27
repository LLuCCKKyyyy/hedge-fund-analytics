# Hedge Fund Analytics Platform

A comprehensive platform for analyzing hedge fund holdings and investment strategies.

## Project Structure

```
hedge-fund-analytics/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Core configurations
│   │   ├── db/                # Database models
│   │   └── services/          # Business logic
│   └── requirements.txt
└── frontend/                   # React frontend
    ├── src/
    │   ├── components/        # Reusable components
    │   ├── pages/             # Page components
    │   └── services/          # API services
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Run the backend server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the development server:
```bash
npm start
```

## Features

- Portfolio Analysis
- Holdings Analysis
- Strategy Analysis
- Comparison Analysis

## Development Status

Currently in initial development phase. Basic framework is set up with the following components:

- Backend API structure with FastAPI
- Frontend React application with TypeScript
- Basic routing and layout implementation

## Next Steps

1. Implement database models
2. Create API endpoints for fund data
3. Develop frontend components
4. Add data visualization
5. Implement analysis features
