#!/usr/bin/env node
const { spawn } = require('child_process');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('🚀 Starting CLASSVERSE Production Suite...');

const server = spawn(npmCmd, ['--workspace=server', 'run', 'start'], {
  stdio: 'inherit',
  shell: isWindows
});

const client = spawn(npmCmd, ['--workspace=@classverse/client', 'run', 'start'], {
  stdio: 'inherit',
  shell: isWindows
});

function cleanup() {
  console.log('\n🛑 Shutting down CLASSVERSE processes...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
