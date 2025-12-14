
import express from 'express';
import pool from '../database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// --- socials ---

router.get('/socials', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM socials ORDER BY display_order ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching socials:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/socials', verifyToken, async (req, res) => {
    const { name, icon_name, url, handle, gradient_from, gradient_via, gradient_to } = req.body;
    try {
        await pool.query(
            'INSERT INTO socials (name, icon_name, url, handle, gradient_from, gradient_via, gradient_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, icon_name, url, handle, gradient_from, gradient_via, gradient_to]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/socials/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    // Allow partial updates
    const fields = [];
    const values = [];

    // Mapping of allowed fields
    const allowed = ['name', 'icon_name', 'url', 'handle', 'gradient_from', 'gradient_via', 'gradient_to', 'active', 'display_order'];

    allowed.forEach(field => {
        if (body[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(body[field]);
        }
    });

    if (fields.length === 0) return res.json({ success: true }); // Nothing to update

    values.push(id);

    try {
        await pool.query(
            `UPDATE socials SET ${fields.join(', ')} WHERE id=?`,
            values
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/socials/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM socials WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Citations ---

router.get('/citations', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM citations ORDER BY display_order ASC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching citations:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/citations', verifyToken, async (req, res) => {
    const { author, quote, icon_name } = req.body;
    try {
        await pool.query(
            'INSERT INTO citations (author, quote, icon_name) VALUES (?, ?, ?)',
            [author, quote, icon_name]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/citations/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const fields = [];
    const values = [];
    const allowed = ['author', 'quote', 'icon_name', 'display_order']; // Added display_order

    allowed.forEach(field => {
        if (body[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(body[field]);
        }
    });

    if (fields.length === 0) return res.json({ success: true });

    values.push(id);

    try {
        await pool.query(
            `UPDATE citations SET ${fields.join(', ')} WHERE id=?`,
            values
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/citations/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM citations WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
