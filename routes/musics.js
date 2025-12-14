
import express from 'express';
import pool from '../database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// GET all musics
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM musics ORDER BY display_order ASC, created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching musics:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST new music
router.post('/', verifyToken, async (req, res) => {
    const { title, creator, file_path, description, display_order } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO musics (title, creator, file_path, description, display_order) VALUES (?, ?, ?, ?, ?)',
            [title, creator, file_path, description, display_order || 0]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update music
router.put('/:id', verifyToken, async (req, res) => {
    // router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const fields = [];
    const values = [];
    const allowed = ['title', 'creator', 'file_path', 'description', 'display_order'];

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
            `UPDATE musics SET ${fields.join(', ')} WHERE id=?`,
            values
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE music
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM musics WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
