const Database = require('better-sqlite3');
const db = new Database('tasks.db');

module.exports = db;
