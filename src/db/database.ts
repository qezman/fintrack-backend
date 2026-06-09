import sqlite3 from "sqlite3";
import path from "path";

const dbPath = path.resolve(__dirname, "../../database.sqlite");

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database", err);
  } else {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        userId TEXT,
        amount REAL,
        type TEXT,
        category TEXT,
        date TEXT,
        note TEXT,
        receiptKey TEXT,
        createdAt TEXT,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);
  }
});
