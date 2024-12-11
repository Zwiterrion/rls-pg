const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

(async () => {
    try {
        const initSQL = require('fs').readFileSync('./db/daikoku.sql').toString();
        await pool.query(initSQL);
        console.log('Database initialized');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up database:', err);
        process.exit(1);
    }
})();
