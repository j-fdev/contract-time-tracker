import 'dotenv/config';

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/contract_time_tracker_db';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

function resolveMongoUri(): string {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

    const baseUrl = process.env.MONGODB_URL?.replace(/\/$/, '');
    const dbName = process.env.DB_NAME;
    if (baseUrl && dbName) return `${baseUrl}/${dbName}`;

    return DEFAULT_MONGODB_URI;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const env = {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    port: Number(process.env.APP_PORT ?? 5000),
    clientOrigin: process.env.ORIGIN ?? 'http://localhost:3000',
    mongoUri: resolveMongoUri(),
    dbName: process.env.DB_NAME,
    dbSync: process.env.DB_SYNC === 'true',
    authSecret: requireEnv('AUTH_SECRET'),
} as const;

if (env.authSecret.length < 32) {
    console.warn(`[config] AUTH_SECRET is shorter than 32 characters. Generate a stronger one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`);
}
