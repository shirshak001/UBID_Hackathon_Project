const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { Client } = require('@elastic/elasticsearch');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Postgres Setup
const pool = new Pool({
  user: 'ubid_user',
  host: 'localhost',
  database: 'ubid_db',
  password: 'ubid_password',
  port: 5432,
});

// Elasticsearch Setup
const esClient = new Client({
  node: 'http://localhost:9200',
});

// Create tables if they don't exist
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS review_queue (
        id SERIAL PRIMARY KEY,
        pair_id VARCHAR(50) UNIQUE,
        score FLOAT,
        record_a JSONB,
        record_b JSONB,
        features JSONB,
        status VARCHAR(20) DEFAULT 'PENDING'
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ubid_registry (
        ubid VARCHAR(50) PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        source_ids TEXT[]
      );
    `);
    console.log("Postgres tables initialized.");
  } catch (err) {
    console.error("Postgres init failed (is Docker running?):", err.message);
  }
};

initDb();

app.get('/api/pairs', async (req, res) => {
  try {
    // Attempt to query Postgres first
    try {
      const result = await pool.query("SELECT * FROM review_queue WHERE status = 'PENDING'");
      if (result.rows.length > 0) {
        return res.json(result.rows);
      }
    } catch (dbErr) {
      console.log("DB query skipped for /api/pairs (DB down). Falling back to ML Engine.");
    }
    
    // Fallback: Call ML engine to get live evaluation
    try {
      const mlResponse = await axios.get('http://localhost:8000/api/ml/pairs');
      if (mlResponse.data && mlResponse.data.length > 0) {
          return res.json(mlResponse.data);
      }
    } catch (e) {
      console.log("ML Engine call failed", e.message);
    }

    // Ultimate fallback if ML Engine returns [] or fails (for prototype demo)
    return res.json([{
        id: "pair_DEMO_2",
        score: 0.85,
        record_a: {
            source: "Shop Est",
            name: "Acme Widgets Pvt Ltd",
            address: "123 MG Road, Bangalore",
            pin: "560001",
            pan: "ABCDE1234F"
        },
        record_b: {
            source: "Factories",
            name: "Acme Widgets Private Limited",
            address: "No 123, M G Road, BNG",
            pin: "560001",
            pan: ""
        },
        features: {
            name_match: 88,
            address_match: 82,
            pan_match: false
        }
    }]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pairs" });
  }
});

app.post('/api/pairs/:pairId/resolve', async (req, res) => {
  const { pairId } = req.params;
  const { action, ubid } = req.body;
  
  try {
    // Attempt DB Update
    try {
      await pool.query("UPDATE review_queue SET status = $1 WHERE pair_id = $2", [action, pairId]);
      if (action === 'merge' && ubid) {
          await pool.query(
              "INSERT INTO ubid_registry (ubid, source_ids) VALUES ($1, $2) ON CONFLICT DO NOTHING", 
              [ubid, [pairId]]
          );
      }
    } catch(e) {
      console.log("DB update skipped (DB down)");
    }

    // Also notify ML Engine to retrain or update local state
    await axios.post(`http://localhost:8000/api/ml/pairs/${pairId}/resolve`, { action, ubid });
    
    res.json({ success: true, action });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resolution failed" });
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM ubid_registry");
    const ubidCount = parseInt(result.rows[0]?.count || "0");
    
    res.json({
      total_businesses: 14205,
      active: 9801,
      dormant: 3004,
      closed: 1400,
      pending_reviews: 2,
      total_ubids_assigned: ubidCount
    });
  } catch (err) {
    console.error("Dashboard fallback mode active (DB down)");
    res.json({
      total_businesses: 14205,
      active: 9801,
      dormant: 3004,
      closed: 1400,
      pending_reviews: 2,
      total_ubids_assigned: 0
    });
  }
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  try {
    if (!q) return res.json([]);
    
    const { hits } = await esClient.search({
      index: 'businesses',
      body: {
        query: {
          multi_match: {
            query: q,
            fields: ['name', 'address', 'pan']
          }
        }
      }
    });
    
    res.json(hits.hits.map(h => h._source));
  } catch (err) {
    console.error("Search fallback mode active (ES down)");
    res.json([]);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Node API Gateway listening on port ${PORT}`);
});
