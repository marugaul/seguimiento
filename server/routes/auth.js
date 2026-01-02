const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// Helper function to log events
function logEvent(email, eventType, details = {}) {
    const detailsStr = JSON.stringify(details);
    // Costa Rica es UTC-6, usar datetime('now', '-6 hours')
    db.run(
        'INSERT INTO audit_logs (email, event_type, details, timestamp) VALUES (?, ?, ?, datetime(\'now\', \'-6 hours\'))',
        [email, eventType, detailsStr],
        (err) => {
            if (err) console.error('Error logging event:', err.message);
        }
    );
}

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        if (!user) {
            logEvent(email, 'login_failed', { reason: 'Usuario no encontrado' });
            return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            logEvent(email, 'login_failed', { reason: 'Contraseña incorrecta' });
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

        // Log successful login
        logEvent(email, 'login', { name: user.name, role: user.role });

        res.json({
            success: true,
            user: {
                email: user.email,
                role: user.role,
                name: user.name,
                loginTime: new Date().toISOString()
            }
        });
    });
});

// Logout endpoint
router.post('/logout', (req, res) => {
    const { email } = req.body;
    if (email) {
        logEvent(email, 'logout', {});
    }
    res.json({ success: true });
});

// Get all users (admin only)
router.get('/users', (req, res) => {
    const { role } = req.query;

    if (role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Solo los administradores pueden ver usuarios' });
    }

    db.all('SELECT id, email, role, name, created_at, updated_at FROM users', [], (err, users) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }
        res.json({ success: true, users });
    });
});

// Create user (admin only)
router.post('/users', async (req, res) => {
    const { email, password, role, name, adminRole } = req.body;

    if (adminRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Solo los administradores pueden crear usuarios' });
    }

    if (!email || !password || !name) {
        return res.status(400).json({ success: false, message: 'Email, contraseña y nombre son requeridos' });
    }

    const emailLower = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        'INSERT INTO users (email, password, role, name, created_at, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\', \'-6 hours\'), datetime(\'now\', \'-6 hours\'))',
        [emailLower, hashedPassword, role || 'user', name],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ success: false, message: 'El usuario ya existe' });
                }
                console.error('Database error:', err.message);
                return res.status(500).json({ success: false, message: 'Error del servidor' });
            }
            res.json({ success: true, message: 'Usuario creado exitosamente', userId: this.lastID });
        }
    );
});

// Update user (admin only)
router.put('/users/:email', async (req, res) => {
    const { email } = req.params;
    const { password, name, role, adminRole } = req.body;

    if (adminRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Solo los administradores pueden actualizar usuarios' });
    }

    const updates = [];
    const values = [];

    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        values.push(hashedPassword);
    }
    if (name) {
        updates.push('name = ?');
        values.push(name);
    }
    if (role) {
        updates.push('role = ?');
        values.push(role);
    }

    updates.push('updated_at = datetime(\'now\', \'-6 hours\')');
    values.push(email.toLowerCase());

    if (updates.length === 1) { // Only updated_at
        return res.status(400).json({ success: false, message: 'No hay campos para actualizar' });
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE email = ?`;

    db.run(sql, values, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, message: 'Usuario actualizado exitosamente' });
    });
});

// Delete user (admin only)
router.delete('/users/:email', (req, res) => {
    const { email } = req.params;
    const { adminRole } = req.body;

    if (adminRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Solo los administradores pueden eliminar usuarios' });
    }

    // Check if this is the last admin
    db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin'], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        db.get('SELECT role FROM users WHERE email = ?', [email.toLowerCase()], (err, user) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ success: false, message: 'Error del servidor' });
            }

            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            if (user.role === 'admin' && result.count === 1) {
                return res.status(400).json({ success: false, message: 'No se puede eliminar el último administrador' });
            }

            db.run('DELETE FROM users WHERE email = ?', [email.toLowerCase()], function(err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).json({ success: false, message: 'Error del servidor' });
                }
                res.json({ success: true, message: 'Usuario eliminado exitosamente' });
            });
        });
    });
});

// Get audit logs (admin only)
router.get('/audit-logs', (req, res) => {
    const { email, adminRole } = req.query;

    if (adminRole !== 'admin') {
        return res.status(403).json({ success: false, message: 'Solo los administradores pueden ver la bitácora' });
    }

    let sql = 'SELECT * FROM audit_logs';
    const params = [];

    if (email) {
        sql += ' WHERE email = ?';
        params.push(email.toLowerCase());
    }

    sql += ' ORDER BY timestamp DESC LIMIT 500';

    db.all(sql, params, (err, logs) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ success: false, message: 'Error del servidor' });
        }

        // Parse details JSON
        const parsedLogs = logs.map(log => ({
            ...log,
            details: log.details ? JSON.parse(log.details) : {}
        }));

        res.json({ success: true, logs: parsedLogs });
    });
});

module.exports = router;
