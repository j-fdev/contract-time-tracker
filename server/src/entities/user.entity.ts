import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

import type { UserRole } from '../types/user.types.js';

// The collection name is kept as "e_users" so existing data is still found.
@Entity('e_users')
export class User {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    first_name!: string;

    @Column()
    last_name!: string;

    @Column({ unique: true })
    email!: string;

    /** bcrypt hash. Only admins have one; it is never selected unless explicitly asked for. */
    @Column({ select: false, nullable: true })
    password?: string;

    @Column()
    phone_number!: string;

    @Column()
    city!: string;

    @Column()
    type!: UserRole;

    @Column()
    disabled!: boolean;

    /** Creation time, Unix seconds. */
    @Column()
    timestamp!: number;
}
