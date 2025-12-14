
import express from 'express';
import pool from '../database.js';
import { verifyToken } from './auth.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// --- Configuration Helper ---
async function getMailer() {
    // defaults
    let config = {
        service: 'gmail', // or host/port
        auth: {
            user: 'test@gmail.com',
            pass: 'test'
        }
    };

    try {
        const [rows] = await pool.query('SELECT key_name, value FROM settings WHERE key_name IN (?, ?, ?, ?)',
            ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass']);

        const settings = rows.reduce((acc, row) => ({ ...acc, [row.key_name]: row.value }), {});

        if (settings.smtp_host) {
            config = {
                host: settings.smtp_host,
                port: settings.smtp_port || 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: settings.smtp_user,
                    pass: settings.smtp_pass
                }
            };
        }
    } catch (e) { }

    return nodemailer.createTransport(config);
}


// --- Routes ---

// Subscribe (Public)
router.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
        await pool.query('INSERT IGNORE INTO subscribers (email) VALUES (?)', [email]);
        res.json({ success: true, message: 'Subscribed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Get Settings (Admin)
router.get('/settings', verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT key_name, value FROM settings WHERE key_name LIKE "smtp_%"');
        const settings = rows.reduce((acc, row) => ({ ...acc, [row.key_name]: row.value }), {});
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Settings (Admin)
router.post('/settings', verifyToken, async (req, res) => {
    const { host, port, user, pass } = req.body;
    try {
        const updates = [
            ['smtp_host', host],
            ['smtp_port', port],
            ['smtp_user', user],
            ['smtp_pass', pass]
        ];

        for (const [key, val] of updates) {
            await pool.query('INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?', [key, val, val]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Newsletter (Admin)
router.post('/send', verifyToken, async (req, res) => {
    const { subject, htmlContent } = req.body;
    // Broadcast to all active subscribers
    try {
        const [subs] = await pool.query('SELECT email FROM subscribers WHERE active = 1');
        if (subs.length === 0) return res.json({ success: true, count: 0 });

        const transporter = await getMailer();

        // In a real app, use a queue (Bull/Redis). Here we iterate (slow but works for small lists).
        let count = 0;
        for (const sub of subs) {
            try {
                await transporter.sendMail({
                    from: '"Anthony.lsc" <noreply@anthonylsc.fr>',
                    to: sub.email,
                    subject: subject || 'New Post from Anthony.lsc',
                    html: htmlContent
                });
                count++;
            } catch (e) {
                console.error('Failed to send to', sub.email, e);
            }
        }

        res.json({ success: true, count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send emails' });
    }
});

export default router;
