const { spawn } = require('child_process');

console.log('Starting Backend Server...');

const child = spawn('npx', ['ts-node', 'src/index.ts'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

child.on('error', (error) => {
  console.error('Failed to start:', error);
});

child.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
});
