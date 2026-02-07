const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Create database connection
// Use environment variable or default paths
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
// Railway: use /data for persistent volume
const dataDir = process.env.DATABASE_PATH ||
                (isProduction ? '/data' : path.join(__dirname, 'data'));

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created data directory: ${dataDir}`);
}

const dbPath = path.join(dataDir, 'database.db');
console.log(`Database path: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', dbPath);
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    // Create users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready');
            createDefaultAdmin();
        }
    });

    // Create audit_logs table
    db.run(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            event_type TEXT NOT NULL,
            details TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating audit_logs table:', err.message);
        } else {
            console.log('Audit logs table ready');
        }
    });
}

// Create default admin user if not exists
function createDefaultAdmin() {
    db.get('SELECT * FROM users WHERE email = ?', ['admin@seguimiento.com'], async (err, row) => {
        if (err) {
            console.error('Error checking for admin:', err.message);
        } else if (!row) {
            const hashedPassword = await bcrypt.hash('Admin2024!', 10);
            db.run(
                'INSERT INTO users (email, password, role, name, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\', \'-6 hours\'), datetime(\'now\', \'-6 hours\'))',
                ['admin@seguimiento.com', hashedPassword, 'admin', 'Administrador'],
                (err) => {
                    if (err) {
                        console.error('Error creating default admin:', err.message);
                    } else {
                        console.log('Default admin user created: admin@seguimiento.com / Admin2024!');
                    }
                }
            );
        }
    });
}

module.exports = db;
