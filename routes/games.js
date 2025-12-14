
import express from 'express';
import pool from '../database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

router.get('/questions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM questions ORDER BY id ASC');
        // Transform JSON string back to object if mysql2 doesn't do it automatically for JSON type
        const questions = rows.map(q => ({ ...q, data: typeof q.data === 'string' ? JSON.parse(q.data) : q.data }));
        res.json(questions);
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/questions', verifyToken, async (req, res) => {
    const { category, difficulty, type, data } = req.body;
    try {
        await pool.query(
            'INSERT INTO questions (category, difficulty, type, data) VALUES (?, ?, ?, ?)',
            [category, difficulty, type, JSON.stringify(data)]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/questions/:id', verifyToken, async (req, res) => {
    const { category, difficulty, type, data } = req.body;
    try {
        await pool.query(
            'UPDATE questions SET category=?, difficulty=?, type=?, data=? WHERE id=?',
            [category, difficulty, type, JSON.stringify(data), req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/questions/:id', verifyToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
