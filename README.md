# QueryMind - Natural Language to SQL Generator

## Introduction
QueryMind is an intelligent tool that translates natural language questions into accurate SQL queries. It enables users to interact with their databases seamlessly without writing complex SQL code. The platform features an AI-powered backend, secure database connections, and a dynamic frontend that visualizes query results through interactive tables and charts.

## Project Type
- Backend: Node.js, Express, PostgreSQL
- Frontend: React, Vite

## Deployed App
- **Frontend**: https://querymind-nltosql.netlify.app/ (Deployed on Netlify)
- **Backend**: (Deployed on Render / Add your link here)

## Directory Structure
```
QueryMind/
├── backend/
│   ├── config/
│   │   ├── database.js
│   ├── routes/
│   │   ├── queryRoutes.js
│   ├── services/
│   │   ├── geminiService.js
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   ├── server.js
├── frontend/
│   ├── public/
│   │   ├── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ChartPanel.jsx
│   │   │   ├── ChartView.jsx
│   │   │   ├── DataManager.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── QueryHistory.jsx
│   │   │   ├── QueryInput.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   ├── SQLResult.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ThemeToggle.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   ├── .env
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── vite.config.js
```

## Video Walkthrough of the Project


## Video Walkthrough of the Codebase


## Features
- Natural Language to SQL generation using Google Gemini AI
- Direct execution of generated queries against a PostgreSQL database
- Interactive data visualization with charts and graphs (Recharts)
- Data management and schema viewing capabilities
- Query history tracking to revisit past questions
- Dark/Light theme toggle for better user experience
- SQL syntax highlighting for readable code output
- Responsive and modern UI with sidebar navigation

## Design Decisions & Assumptions
- **PostgreSQL Database**: Chosen for its robust relational data handling and querying capabilities.
- **Google Gemini AI**: Utilized for its advanced natural language processing to generate accurate and optimized SQL queries.
- **RESTful API Structure**: Followed RESTful principles for clean communication between the frontend and backend.
- **Vite & React**: Chosen for fast development, optimal build times, and modular component architecture.
- **Recharts**: Integrated for rendering highly customizable and responsive charts based on query results.
- **Security**: CORS is configured to securely allow requests only from specific deployed origins or local development environments.

## Installation & Getting Started
Follow these steps to set up the project locally:

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate to the backend directory
cd QueryMind/backend

# Install backend dependencies
npm install

# Set up environment variables
# Create a .env file in the backend folder and add:
# PORT=5000
# DATABASE_URL=<your-postgresql-url>
# GEMINI_API_KEY=<your-google-gemini-api-key>

# Start the backend server
npm start

# In a new terminal, navigate to the frontend directory
cd QueryMind/frontend

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```

## Usage
### Running the Backend Server
```bash
npm start
# or for development
npm run dev
```
### Running the Frontend
```bash
npm run dev
```

### Example API Usage
```bash
# Get database schema
GET /api/schema

# Generate and execute SQL from natural language
POST /api/query
{
  "prompt": "Show me the total sales for last month"
}
```

## Credentials
*(Optional)* Add any test credentials if your platform uses authentication, otherwise leave this section out.

## APIs Used
- **Google Gemini API** (Natural Language Processing to SQL)
- **PostgreSQL Database** (Data Storage & Query Execution)

## API Endpoints
### Query and Data
- **POST** `/api/query` - Convert natural language to SQL and execute
- **GET** `/api/schema` - Get database schema information
- **GET** `/api/suggestions` - Get sample query suggestions
- **GET** `/api/health` - Health check endpoint

## Technology Stack

### Backend
- **Node.js** - Backend runtime environment
- **Express.js** - Web framework for handling API requests
- **PostgreSQL & pg** - Relational database and Node.js client
- **@google/genai** - Google Gemini API client for AI integration
- **Dotenv** - Environment variable management
- **Cors** - Cross-Origin Resource Sharing middleware

### Frontend
- **React** - JavaScript library for building user interfaces
- **Vite** - Next-generation frontend tooling
- **Axios** - Promise-based HTTP client for making API requests
- **Recharts** - Composable charting library built on React components
- **Lucide React** - Beautiful and consistent icons
- **React Syntax Highlighter** - For rendering formatted SQL code blocks

---
🚀 **QueryMind is ready for further expansion!** Feel free to contribute or suggest improvements. 🎉
