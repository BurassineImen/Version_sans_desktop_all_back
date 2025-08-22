import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
process.env.DB_PATH = dbPath;

require('./server.js'); // Lancer le backend