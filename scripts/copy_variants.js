const fs = require('fs');
const path = require('path');

const sourceDir = "C:\\Users\\aliha\\.gemini\\antigravity\\brain\\acfc1df4-0ff9-4bde-b8f4-e5da8466691a";
const destDir = "d:\\aethelon\\public\\variants";

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const files = fs.readdirSync(sourceDir);
for (const file of files) {
    if (file.endsWith('.png') && file.includes('_177')) {
        const parts = file.split('_177');
        const newName = parts[0] + '.png';
        fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, newName));
    }
}
