import { DataSource } from 'typeorm';

import { env } from '../config/env.js';
import { Project, Punch, Timesheet, User } from '../entities/index.js';

export const AppDataSource = new DataSource({
    type: 'mongodb',
    url: env.mongoUri,
    database: env.dbName,
    entities: [User, Project, Punch, Timesheet],
    synchronize: env.dbSync,
    logging: false,
});
