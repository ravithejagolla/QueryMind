import express from 'express';
import pool from '../config/database.js';
import { generateSQL } from '../services/geminiService.js';

const router = express.Router();

// POST /api/query - Convert natural language to SQL and execute
router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Step 1: Generate SQL using Gemini
    const aiResult = await generateSQL(question.trim());

    // If clarification needed or error, return without executing
    if (aiResult.status !== 'success') {
      return res.json({
        status: aiResult.status,
        message: aiResult.response,
        explanation: aiResult.explanation,
        sql: null,
        data: null,
        columns: null,
        rowCount: 0,
      });
    }

    const sqlQuery = aiResult.response;

    // Safety check: ensure it's a SELECT query only
    const normalizedQuery = sqlQuery.trim().toUpperCase();
    if (!normalizedQuery.startsWith('SELECT') && !normalizedQuery.startsWith('WITH')) {
      return res.json({
        status: 'error',
        message: 'Only SELECT queries are allowed for safety reasons.',
        explanation: 'The generated query was not a SELECT statement.',
        sql: sqlQuery,
        data: null,
        columns: null,
        rowCount: 0,
      });
    }

    // Step 2: Execute the SQL query
    const result = await pool.query(sqlQuery);

    const columns = result.fields.map(f => f.name);
    const data = result.rows;

    return res.json({
      status: 'success',
      message: 'Query executed successfully',
      explanation: aiResult.explanation,
      sql: sqlQuery,
      data: data,
      columns: columns,
      rowCount: data.length,
    });

  } catch (error) {
    console.error('Query error:', error.message);
    
    // Handle database errors
    if (error.code) {
      return res.status(200).json({
        status: 'db_error',
        message: `Database error: ${error.message}`,
        explanation: 'There was an error executing the generated SQL query.',
        sql: null,
        data: null,
        columns: null,
        rowCount: 0,
      });
    }

    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
      explanation: null,
      sql: null,
      data: null,
      columns: null,
      rowCount: 0,
    });
  }
});

// GET /api/schema - Get database schema info
router.get('/schema', async (req, res) => {
  try {
    const tablesQuery = `
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default
      FROM information_schema.tables t
      JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name IN ('customers', 'products', 'orders', 'order_items')
      ORDER BY t.table_name, c.ordinal_position;
    `;

    const result = await pool.query(tablesQuery);
    
    // Group by table
    const schema = {};
    result.rows.forEach(row => {
      if (!schema[row.table_name]) {
        schema[row.table_name] = [];
      }
      schema[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
      });
    });

    // Get row counts
    const counts = await Promise.all(
      ['customers', 'products', 'orders', 'order_items'].map(async (table) => {
        try {
          const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
          return { table, count: parseInt(countResult.rows[0].count) };
        } catch {
          return { table, count: 0 };
        }
      })
    );

    const tableCounts = {};
    counts.forEach(({ table, count }) => { tableCounts[table] = count; });

    res.json({ schema, tableCounts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/health - Health check
router.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// GET /api/suggestions - Sample queries for the user
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "Show me all customers from India",
    "What are the top 5 best-selling products?",
    "List all pending orders",
    "What is the total revenue by country?",
    "Which products are low on stock (less than 100 units)?",
    "Show me the average order value by status",
    "Who are the customers who have placed more than one order?",
    "What is the most popular product category?",
    "Show me all orders placed in 2024 with their customer names",
    "What are the top 3 products with the highest total revenue?",
    "How many orders does each customer have?",
    "Show me all Electronics products sorted by price",
  ];
  res.json({ suggestions });
});

// POST /api/data/insert - Insert a new row into a table
router.post('/data/insert', async (req, res) => {
  const ALLOWED_TABLES = ['customers', 'products', 'orders', 'order_items'];
  const { table, row } = req.body;

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: 'Invalid or missing table name.' });
  }
  if (!row || typeof row !== 'object' || Object.keys(row).length === 0) {
    return res.status(400).json({ error: 'Row data is required.' });
  }

  // Build parameterized INSERT
  const cols = Object.keys(row);
  const values = Object.values(row);
  const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
  const colNames = cols.map(c => `"${c}"`).join(', ');
  const sql = `INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) RETURNING *`;

  try {
    const result = await pool.query(sql, values);
    return res.json({ status: 'success', row: result.rows[0], message: `Row inserted into ${table}.` });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

// DELETE /api/data/delete/:table/:id - Delete a row by primary key
router.delete('/data/delete/:table/:id', async (req, res) => {
  const ALLOWED_TABLES = {
    customers: 'customer_id',
    products: 'product_id',
    orders: 'order_id',
    order_items: 'item_id',
  };
  const { table, id } = req.params;

  if (!ALLOWED_TABLES[table]) {
    return res.status(400).json({ error: 'Invalid table name.' });
  }

  const pkCol = ALLOWED_TABLES[table];
  const sql = `DELETE FROM ${table} WHERE ${pkCol} = $1 RETURNING *`;

  try {
    const result = await pool.query(sql, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', error: `No row found with id ${id} in ${table}.` });
    }
    return res.json({ status: 'success', deleted: result.rows[0], message: `Row ${id} deleted from ${table}.` });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

// PUT /api/data/update/:table/:id - Update a row by primary key
router.put('/data/update/:table/:id', async (req, res) => {
  const ALLOWED_TABLES = {
    customers:   'customer_id',
    products:    'product_id',
    orders:      'order_id',
    order_items: 'item_id',
  };
  const { table, id } = req.params;
  const { updates } = req.body;

  if (!ALLOWED_TABLES[table]) {
    return res.status(400).json({ error: 'Invalid table name.' });
  }
  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No update fields provided.' });
  }

  const pkCol = ALLOWED_TABLES[table];
  const cols = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${pkCol} = $${cols.length + 1} RETURNING *`;

  try {
    const result = await pool.query(sql, [...values, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `No row found with id ${id} in ${table}.` });
    }
    return res.json({ status: 'success', row: result.rows[0], message: `Row ${id} updated in ${table}.` });
  } catch (err) {
    return res.status(400).json({ status: 'error', error: err.message });
  }
});

export default router;

