
import pool from './database.js';
import bcrypt from 'bcrypt';

const createTables = async () => {
  try {
    // Admin Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Socials Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS socials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        icon_name VARCHAR(50) NOT NULL, -- Name of Lucide icon
        url VARCHAR(255) NOT NULL,
        handle VARCHAR(255),
        gradient_from VARCHAR(50),
        gradient_via VARCHAR(50),
        gradient_to VARCHAR(50),
        active BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0
      )
    `);

    // Citations (Philosophy) Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS citations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author VARCHAR(255) NOT NULL,
        quote TEXT NOT NULL,
        icon_name VARCHAR(50) DEFAULT 'Quote',
        display_order INT DEFAULT 0
      )
    `);

    // Writings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS writings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        excerpt TEXT,
        content MEDIUMTEXT, -- Supports longer text
        image_url VARCHAR(255),
        gradient_color VARCHAR(100),
        tags JSON,
        views INT DEFAULT 0,
        word_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Questions Table (for Games)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
        type VARCHAR(50) NOT NULL, -- text, multiple-choice, audio, etc.
        data JSON NOT NULL, -- Stores question text (FR/EN), answers, options, media URLs
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Musics Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS musics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        creator VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        description TEXT,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subscribers Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings Table (for SMTP, etc)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) NOT NULL UNIQUE,
        value TEXT,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ All tables created or verified.");

    // Seed default Admin user if none exists
    const [rows] = await pool.query('SELECT * FROM admin_users');
    if (rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10); // Default password: admin123
      await pool.query('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', ['admin', hash]);
      console.log("🔒 Default admin user created (user: admin, pass: admin123)");
    }

  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};

export default createTables;
