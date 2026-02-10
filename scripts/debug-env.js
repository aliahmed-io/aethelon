const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log("CWD:", process.cwd());
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "FOUND" : "NOT FOUND");
if (process.env.DATABASE_URL) {
    console.log("Value starts with:", process.env.DATABASE_URL.substring(0, 15));
}

try {
    const envPath = path.resolve(process.cwd(), '.env');
    console.log("Looking for .env at:", envPath);
    if (fs.existsSync(envPath)) {
        console.log(".env exists. Size:", fs.statSync(envPath).size);
        const content = fs.readFileSync(envPath, 'utf8');
        console.log("First 50 chars:", content.substring(0, 50));
    } else {
        console.log(".env does NOT exist at path.");
    }
} catch (e) {
    console.error("Error reading .env:", e);
}
