import pool from './database.js';

export const createPartiesTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS parties (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(10) NOT NULL UNIQUE,
      players JSON NOT NULL,
      game JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  try {
    await pool.query(sql);
    console.log('Table "parties" created successfully or already exists.');
  } catch (error) {
    console.error('Error creating "parties" table:', error);
  }
};

// Note: do not call `createPartiesTable()` on module import.
// The server imports this file and calls `createPartiesTable()` explicitly.
