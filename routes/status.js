import express from 'express';
import pool from '../database.js';
import os from 'os';

const router = express.Router();

router.get('/', async (req, res) => {
    const start = Date.now();

    const status = {
        server: {
            status: 'online',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            memory: process.memoryUsage(),
            load: os.loadavg(),
            platform: os.platform(),
            version: process.version
        },
        database: {
            status: 'unknown',
            latency: 0
        },
        services: {
            github: { status: 'operational', label: 'GitHub Sync' }, // Static for now, could be dynamic
            railway: { status: 'operational', label: 'Railway Cloud' }
        }
    };

    try {
        // Check Database connection
        const dbStart = Date.now();
        await pool.query('SELECT 1');
        status.database.latency = Date.now() - dbStart;
        status.database.status = 'connected';
    } catch (error) {
        status.database.status = 'disconnected';
        status.database.error = error.message;
        console.error('Database health check failed:', error);
        // Don't send 500, we want to return the partial status to the dashboard
    }

    // Calculate total response time
    status.server.latency = Date.now() - start;

    res.json(status);
});

export default router;
