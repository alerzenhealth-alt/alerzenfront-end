import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'data', 'db.json');

const adapter = new JSONFile(file);
const db = new Low(adapter, {
    tests: [],
    promoCodes: [],
    slides: [],
    admin: { username: "admin", twoFactorSecret: null }
});

// Initialize DB
console.log("Reading DB...");
await db.read();
console.log("DB Read.");
db.data ||= {
    tests: [],
    packages: [],
    promoCodes: [],
    slides: [],
    admin: { username: "admin", twoFactorSecret: null } // Password handled via env
};
await db.write();
console.log("DB Initialized.");

export { db };
