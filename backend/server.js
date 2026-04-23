import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import queryRoutes from './routes/queryRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', queryRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🧠 QueryMind API - Natural Language to SQL Generator',
    version: '1.0.0',
    endpoints: {
      'POST /api/query': 'Convert natural language to SQL and execute',
      'GET /api/schema': 'Get database schema information',
      'GET /api/suggestions': 'Get sample query suggestions',
      'GET /api/health': 'Health check',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 QueryMind Backend running on http://localhost:${PORT}`);
  console.log(`📡 API docs: http://localhost:${PORT}/`);
});

export default app;
