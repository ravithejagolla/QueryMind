# QueryMind - Natural Language to SQL Generator

## Introduction
QueryMind is an intelligent tool that allows users to seamlessly convert natural language questions into executable SQL queries. By leveraging the power of Google's Gemini AI, the application translates plain English into optimized SQL, executes the queries against a connected PostgreSQL database, and visualizes the results. It also supports manual data entry and schema exploration.

## Project Type
- Backend: Node.js, Express
- Frontend: React, Vite

## Deployed App
- **Frontend**: https://querymind-nltosql.netlify.app

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
│   ├── package.json
│   ├── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
```

## Features
- **Natural Language to SQL**: Converts plain English queries into valid PostgreSQL commands using Gemini AI.
- **Query Execution & Safety**: Automatically executes SELECT queries safely and returns results directly in the UI.
- **Data Visualization**: Presents the query results using structured tables and Recharts for analytical insights.
- **Schema Explorer**: Interactive view of the current database schema, including tables and column definitions.
- **Data Management**: CRUD capabilities to easily insert, update, or delete records in the database via the UI.
- **Query Suggestions**: Provides helpful query examples based on the existing schema.

## Design Decisions & Assumptions
- **PostgreSQL Database**: Selected for robust relational data handling.
- **Gemini AI**: Utilized for highly accurate translation of complex natural language into SQL.
- **Safety First**: The backend only permits `SELECT` and `WITH` statements from the AI to prevent unauthorized data mutations.
- **Separation of Concerns**: Clean REST API architecture with modularized routing and services.

## Installation & Getting Started
Follow these steps to set up the project locally:

```bash
# Clone the repository
git clone https://github.com/your-username/QueryMind.git

# Setup Backend
cd QueryMind/backend
npm install
# Create a .env file and add your GEMINI_API_KEY and DATABASE_URL
npm run dev

# Setup Frontend
cd ../frontend
npm install
npm run dev
```

## Usage
### Running the Backend Server
```bash
cd backend
npm run dev
```

### Running the Frontend Server
```bash
cd frontend
npm run dev
```

## Credentials
*This project requires an active PostgreSQL database and a Google Gemini API Key. Set them in your `.env` file.*

## APIs Used
- **Google Gemini API** (For natural language to SQL translation)
- **PostgreSQL Database** (Via `pg` library)

## API Endpoints
### Query and Schema
- **POST** `/api/query` - Convert natural language to SQL and execute
- **GET** `/api/schema` - Get database schema information
- **GET** `/api/suggestions` - Get sample query suggestions
- **GET** `/api/health` - Health check

### Data Management
- **POST** `/api/data/insert` - Insert a new row into a table
- **PUT** `/api/data/update/:table/:id` - Update a row by primary key
- **DELETE** `/api/data/delete/:table/:id` - Delete a row by primary key

## Technology Stack

### Backend
- **Node.js** - Backend runtime environment
- **Express.js** - Web framework for handling API requests
- **PostgreSQL** - Relational database
- **@google/genai** - Google Gemini SDK for AI integrations
- **pg** - PostgreSQL client for Node.js

### Frontend
- **React** - JavaScript library for building user interfaces
- **Vite** - Next-generation frontend tooling and bundler
- **Axios** - Promise-based HTTP client for making API requests
- **Recharts** - Composable charting library for React
- **Lucide React** - Icon library
- **React Syntax Highlighter** - For rendering formatted SQL snippets
