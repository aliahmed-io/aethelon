const { execSync } = require('child_process');
require('dotenv').config();

try {
    const prismaPath = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
    execSync(`${prismaPath} generate`, { stdio: 'inherit', env: process.env });
} catch (error) {
    console.error("Execution failed:", error.message);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    process.exit(1);
}
