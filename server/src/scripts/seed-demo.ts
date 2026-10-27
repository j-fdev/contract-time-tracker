/**
 * Fills the database with fictional clients, projects and punches, for screenshots and demos.
 *
 * npm run seed:demo   -> separate demo database (contract_time_tracker_demo), with a demo admin.
 *                        Then set DB_NAME=contract_time_tracker_demo in .env to use it.
 * npm run seed:main   -> YOUR database (DB_NAME). Saves a JSON backup first, then replaces every
 *                        user except SEED_KEEP_EMAIL (set in .env), and all projects and punches.
 */
import 'reflect-metadata';
import { writeFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import { DataSource, type MongoRepository } from 'typeorm';
import type { ObjectId } from 'mongodb';

import { env, withDatabase } from '../config/env.js';
import { Project, Punch, Timesheet, User } from '../entities/index.js';
import type { PunchType } from '../types/punch.types.js';
import { getWeekPeriod, nowInSeconds } from '../utils/time.js';

const DEMO_DB_NAME = process.env.DEMO_DB_NAME ?? 'contract_time_tracker_demo';
const USE_MAIN_DATABASE = process.argv.includes('--main');
const KEEP_EMAIL = process.env.SEED_KEEP_EMAIL?.trim().toLowerCase();
const DEMO_ADMIN = { email: 'demo@contracttimetracker.dev', password: 'Demo-Tracker-2026!' };
const DAYS_OF_HISTORY = 21;

const clients = [
    { first_name: 'Isabelle', last_name: 'Gagnon', company_name: 'Atelier Boréal Design', email: 'isabelle@atelierboreal.ca', phone_number: '514-555-0142', address: '1450 rue Saint-Denis', city: 'Montréal', province: 'QC', postal_code: 'H2X 3J8' },
    { first_name: 'Marc-André', last_name: 'Pelletier', company_name: 'Pelletier Rénovations inc.', email: 'ma.pelletier@pelletier-renovations.ca', phone_number: '450-555-0187', address: '87 boulevard de la Concorde Est', city: 'Laval', province: 'QC', postal_code: 'H7G 2B4' },
    { first_name: 'Sophie', last_name: 'Nguyen', company_name: 'Clinique Physio Rive-Sud', email: 'sophie.nguyen@physiorivesud.ca', phone_number: '450-555-0119', address: '2300 chemin de Chambly, bureau 200', city: 'Longueuil', province: 'QC', postal_code: 'J4J 3Y2' },
    { first_name: 'David', last_name: 'Thompson', company_name: 'Northline Logistics', email: 'd.thompson@northlinelogistics.ca', phone_number: '416-555-0173', address: '220 King Street West, Suite 1100', city: 'Toronto', province: 'ON', postal_code: 'M5H 1K4' },
    { first_name: 'Émilie', last_name: 'Roy', company_name: '', email: 'emilie.roy.photo@outlook.com', phone_number: '418-555-0161', address: '35 rue des Érables', city: 'Québec', province: 'QC', postal_code: 'G1R 2K7' },
    { first_name: 'Karim', last_name: 'Benali', company_name: 'Café Solstice', email: 'karim@cafesolstice.ca', phone_number: '514-555-0128', address: '5020 avenue du Parc', city: 'Montréal', province: 'QC', postal_code: 'H2V 4E9' },
];

// clientIndex points into `clients` above. The first project gets a punch running "now".
const projects = [
    { clientIndex: 3, project_name: 'Fleet Tracking Dashboard', description: 'Real-time dashboard for delivery trucks and drivers', hour_rate: 110 },
    { clientIndex: 0, project_name: 'Boréal Online Store', description: 'E-commerce website with online payments', hour_rate: 95 },
    { clientIndex: 2, project_name: 'Patient Booking Portal', description: 'Online appointment booking for physiotherapy clinics', hour_rate: 105 },
    { clientIndex: 1, project_name: 'Renovation Quote Calculator', description: 'Web app that estimates renovation costs for customers', hour_rate: 90 },
    { clientIndex: 0, project_name: 'Brand Refresh Landing Page', description: 'New landing page following the updated brand guide', hour_rate: 85 },
    { clientIndex: 5, project_name: 'Online Ordering Menu', description: 'Mobile-friendly menu with pickup orders', hour_rate: 75 },
    { clientIndex: 4, project_name: 'Photography Portfolio', description: 'Portfolio website with image galleries', hour_rate: 70 },
];

/** Small deterministic random generator, so every run produces the same demo data. */
function createRandom(seed: number) {
    let state = seed;
    return (min: number, max: number) => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return min + Math.floor((state / 4294967296) * (max - min + 1));
    };
}

const MINUTE = 60;
const HOUR = 60 * MINUTE;

interface PunchDraft {
    projectIndex: number;
    type: PunchType;
    punch_in: number;
    punch_out: number;
}

/** A work day: work, short break, work, lunch, work. Breaks start exactly when work stops. */
function buildWorkDay(projectIndexes: number[], dayStart: number, random: ReturnType<typeof createRandom>): PunchDraft[] {
    const drafts: PunchDraft[] = [];
    let time = dayStart + random(8 * 60 + 15, 9 * 60 + 10) * MINUTE;

    for (const projectIndex of projectIndexes) {
        const blocks = [random(80, 130), random(60, 100)];
        blocks.forEach((minutes, index) => {
            const end = time + minutes * MINUTE;
            drafts.push({ projectIndex, type: 'in', punch_in: time, punch_out: end });
            time = end;
            if (index === 0) {
                const breakEnd = time + random(10, 20) * MINUTE;
                drafts.push({ projectIndex, type: 'break', punch_in: time, punch_out: breakEnd });
                time = breakEnd;
            }
        });
        time += random(30, 45) * MINUTE; // lunch / switching project
    }
    return drafts;
}

function buildHistory(now: number): PunchDraft[] {
    const random = createRandom(2026);
    const drafts: PunchDraft[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let daysAgo = DAYS_OF_HISTORY; daysAgo >= 1; daysAgo -= 1) {
        const day = new Date(today);
        day.setDate(day.getDate() - daysAgo);
        const weekday = day.getDay();
        if (weekday === 0 || weekday === 6) continue;

        const first = random(0, projects.length - 1);
        const second = (first + random(1, projects.length - 1)) % projects.length;
        drafts.push(...buildWorkDay([first, second], day.getTime() / 1000, random));
    }

    // Today: worked on the first project this morning, took a break, and is still working.
    const start = now - 3 * HOUR - 20 * MINUTE;
    const breakStart = start + 2 * HOUR;
    const breakEnd = breakStart + 15 * MINUTE;
    drafts.push(
        { projectIndex: 0, type: 'in', punch_in: start, punch_out: breakStart },
        { projectIndex: 0, type: 'break', punch_in: breakStart, punch_out: breakEnd },
        { projectIndex: 0, type: 'in', punch_in: breakEnd, punch_out: 0 },
    );
    return drafts;
}

async function createDemoAdmin(users: MongoRepository<User>, createdAt: number) {
    await users.save(users.create({
        first_name: 'Jean-François',
        last_name: 'Drouin',
        email: DEMO_ADMIN.email,
        password: await bcrypt.hash(DEMO_ADMIN.password, 12),
        phone_number: '514-555-0100',
        city: 'Montréal',
        type: 'Admin',
        disabled: false,
        timestamp: createdAt,
    }));
}

async function seed() {
    if (!USE_MAIN_DATABASE && DEMO_DB_NAME === env.dbName) {
        throw new Error(`DEMO_DB_NAME (${DEMO_DB_NAME}) is the same as DB_NAME. Refusing to overwrite your real database.`);
    }
    if (USE_MAIN_DATABASE && !KEEP_EMAIL) {
        throw new Error('Set SEED_KEEP_EMAIL in .env (the admin account to keep) before seeding your main database.');
    }

    const databaseName = USE_MAIN_DATABASE ? env.dbName : DEMO_DB_NAME;
    if (!databaseName) throw new Error('Set DB_NAME in .env first.');

    const dataSource = new DataSource({
        type: 'mongodb',
        url: withDatabase(env.mongoUri, databaseName),
        database: databaseName,
        entities: [User, Project, Punch, Timesheet],
        synchronize: true,
    });
    await dataSource.initialize();

    // Safety net: never touch a database other than the one intended.
    const connectedTo = (dataSource.driver as unknown as { database?: string }).database;
    if (connectedTo !== databaseName) {
        await dataSource.destroy();
        throw new Error(`Connected to "${connectedTo}" instead of "${databaseName}". Nothing was changed.`);
    }
    console.log(`[seed] Connected to database "${connectedTo}"`);

    const users = dataSource.getMongoRepository(User);
    const projectsRepository = dataSource.getMongoRepository(Project);
    const punches = dataSource.getMongoRepository(Punch);
    const timesheets = dataSource.getMongoRepository(Timesheet);

    const now = nowInSeconds();
    const createdAt = now - (DAYS_OF_HISTORY + 10) * 24 * HOUR;

    // Always save what is about to be replaced, whatever the mode.
    if ((await users.count()) + (await projectsRepository.count()) + (await punches.count()) > 0) {
        const backup = {
            database: databaseName,
            createdAt: new Date().toISOString(),
            users: await users.find(),
            projects: await projectsRepository.find(),
            punches: await punches.find(),
            timesheets: await timesheets.find(),
        };
        const backupFile = `seed-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        writeFileSync(backupFile, JSON.stringify(backup, null, 2));
        console.log(`[seed] Backup of the current data saved to ${backupFile}`);

    }

    if (USE_MAIN_DATABASE) {
        const keptAdmin = await users.findOne({ where: { email: KEEP_EMAIL } });
        if (!keptAdmin) {
            throw new Error(`No user with email ${KEEP_EMAIL} in "${databaseName}". Nothing was changed.`);
        }

        await users.deleteMany({ email: { $ne: KEEP_EMAIL } });
        for (const repository of [projectsRepository, punches, timesheets]) {
            await repository.deleteMany({});
        }
    } else {
        // The demo database is rebuilt from scratch every time.
        for (const repository of [users, projectsRepository, punches, timesheets]) {
            await repository.deleteMany({});
        }
        await createDemoAdmin(users, createdAt);
    }

    const savedClients = await users.save(
        clients.map((client, index) => users.create({ ...client, type: 'Client', disabled: false, timestamp: createdAt + index * HOUR })),
    );

    const savedProjects = await projectsRepository.save(
        projects.map((project, index) => projectsRepository.create({
            client_id: savedClients[project.clientIndex]._id,
            project_name: project.project_name,
            description: project.description,
            notes: '',
            hour_rate: project.hour_rate,
            active: true,
            timestamp: createdAt + (index + 1) * 24 * HOUR,
        })),
    );

    // One timesheet per project and week, like the real app creates them.
    const timesheetIds = new Map<string, ObjectId>();
    async function getTimesheetId(projectId: ObjectId, punchIn: number): Promise<ObjectId> {
        const { year, period } = getWeekPeriod(punchIn);
        const key = `${projectId.toString()}-${year}-${period}`;
        if (!timesheetIds.has(key)) {
            const timesheet = await timesheets.save(timesheets.create({
                project_id: projectId, year, week_period: period, sum: 0, interval: 0, timestamp: punchIn,
            }));
            timesheetIds.set(key, timesheet._id);
        }
        return timesheetIds.get(key)!;
    }

    const drafts = buildHistory(now);
    for (const draft of drafts) {
        const projectId = savedProjects[draft.projectIndex]._id;
        await punches.save(punches.create({
            project_id: projectId,
            timesheet_id: await getTimesheetId(projectId, draft.punch_in),
            punch_in: draft.punch_in,
            punch_out: draft.punch_out,
            type: draft.type,
            notes: '',
            timestamp: draft.punch_in,
        }));
    }

    await dataSource.destroy();

    console.log(`[seed] Database "${databaseName}" is ready:`);
    console.log(`       ${savedClients.length} clients, ${savedProjects.length} projects, ${drafts.length} punches, ${timesheetIds.size} timesheets`);
    if (USE_MAIN_DATABASE) {
        console.log(`[seed] Kept your account ${KEEP_EMAIL}. Log in with your usual password.`);
    } else {
        console.log(`[seed] To use it, set DB_NAME=${DEMO_DB_NAME} in .env and restart the server.`);
        console.log(`[seed] Log in with ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`);
    }
}

seed().catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
});
