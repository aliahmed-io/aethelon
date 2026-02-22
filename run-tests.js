const { execSync } = require('child_process');
const fs = require('fs');

try {
    const o = execSync('npx playwright test e2e/shop.spec.ts --reporter=json', { encoding: 'utf8' });
    fs.writeFileSync('e2e.json', o);
} catch (e) {
    fs.writeFileSync('e2e.json', e.stdout.toString());
}
