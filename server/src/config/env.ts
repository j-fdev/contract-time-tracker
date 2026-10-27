import 'dotenv/config';

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/contract_time_tracker_db';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

/** Returns the connection URI with its database name replaced by `dbName`. */
export function withDatabase(uri: string, dbName: string): string {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(?:\/[^?]*)?(\?.*)?$/);
    if (!match) throw new Error('Invalid MongoDB connection string.');
    const [, hostPart, query = ''] = match;
    return `${hostPart}/${dbName}${query}`;
}

function resolveMongoUri(): string {
    const baseUri = process.env.MONGODB_URI || process.env.MONGODB_URL || DEFAULT_MONGODB_URI;
    // DB_NAME always wins over a database name written in the URI, so switching it really switches databases.
    return process.env.DB_NAME ? withDatabase(baseUri, process.env.DB_NAME) : baseUri;
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
