const express = require('express');
const { Pool } = require('pg');

// Initialize Express and PostgreSQL pool
const app = express();
app.use(express.json());
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'test'
});

// Middleware to authenticate users via `x-username` header
app.use(async (req, res, next) => {
    const username = req.headers['x-username'];
    if (!username) {
        return res.status(401).json({ error: 'Missing x-username header' });
    }

    try {
        console.log(username)
        const client = await pool.connect();
        const result = await client.query('SELECT id FROM users WHERE username = $1', [username]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.userId = result.rows[0].id; // Store user ID for use in subsequent requests
        next();
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to list all APIs the user has access to
app.get('/apis', async (req, res) => {
    try {
        const client = await pool.connect();
        const query = `
      SELECT a.id, a.name, a.description
      FROM apis a
      JOIN team_memberships tm ON tm.team_id = a.team_id
      WHERE tm.user_id = $1
    `;
        const result = await client.query(query, [req.userId]);
        client.release();

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching APIs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to create a new API (requires `api-administrator` role)
app.post('/apis', async (req, res) => {
    const { teamId, name, description } = req.body;

    try {
        const client = await pool.connect();

        // Check if the user is an `api-administrator` in the specified team
        const roleCheck = `
      SELECT 1
      FROM team_memberships
      WHERE user_id = $1 AND team_id = $2 AND role = 'api-administrator'
    `;
        const roleResult = await client.query(roleCheck, [req.userId, teamId]);

        if (roleResult.rowCount === 0) {
            client.release();
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Create the new API
        const insertQuery = `
      INSERT INTO apis (team_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id, name, description
    `;
        const result = await client.query(insertQuery, [teamId, name, description]);
        client.release();

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating API:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to edit an API (requires `api-administrator` role)
app.put('/apis/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
        const client = await pool.connect();

        // Check if the user is an `api-administrator` for the API's team
        const roleCheck = `
      SELECT 1
      FROM apis a
      JOIN team_memberships tm ON tm.team_id = a.team_id
      WHERE a.id = $1 AND tm.user_id = $2 AND tm.role = 'api-administrator'
    `;
        const roleResult = await client.query(roleCheck, [id, req.userId]);

        if (roleResult.rowCount === 0) {
            client.release();
            return res.status(403).json({ error: 'Permission denied' });
        }

        // Update the API
        const updateQuery = `
      UPDATE apis
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING id, name, description
    `;
        const result = await client.query(updateQuery, [name, description, id]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'API not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error editing API:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
