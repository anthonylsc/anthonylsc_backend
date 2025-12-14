
import express from 'express';
import pool from '../database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

router.get('/writings', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM writings ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching writings:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.get('/writings/:id/view', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE writings SET views = views + 1 WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/writings', verifyToken, async (req, res) => {
    const { title, category, date, excerpt, content, image_url, gradient_color, tags, word_count } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO writings (title, category, date, excerpt, content, image_url, gradient_color, tags, word_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, category, date, excerpt, content, image_url, gradient_color, JSON.stringify(tags), word_count]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/writings/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { title, category, date, excerpt, content, image_url, gradient_color, tags, word_count } = req.body;
    try {
        await pool.query(
            'UPDATE writings SET title=?, category=?, date=?, excerpt=?, content=?, image_url=?, gradient_color=?, tags=?, word_count=? WHERE id=?',
            [title, category, date, excerpt, content, image_url, gradient_color, JSON.stringify(tags), word_count, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/writings/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM writings WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
