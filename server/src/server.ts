import 'reflect-metadata';
import http from 'node:http';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { AppDataSource } from './db/data-source.js';
import { initializeSocket } from './socket.js';

async function startServer() {
    await AppDataSource.initialize();
    console.log('[db] Connected to MongoDB');

    const server = http.createServer(createApp());
    initializeSocket(server);

    server.listen(env.port, () => {
        console.log(`[server] Listening on http://localhost:${env.port}`);
    });
}

startServer().catch((error) => {
    console.error('[server] Failed to start', error);
    process.exit(1);
});
