import { App } from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT) : 3002;

async function main() {
  const app = new App();

  // Handle cleanup on shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await app.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await app.cleanup();
    process.exit(0);
  });

  // Start the server
  await app.start(port);
}

main().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
}); 