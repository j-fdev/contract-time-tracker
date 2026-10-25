import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

import type { UserRole } from '../types/user.types.js';

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
    
    @Column({ select: false, nullable: true })
    password?: string;
    
    @Column()
    phone_number!: string;
    
    @Column({ nullable: true })
    company_name?: string;
    
    @Column({ nullable: true })
    address?: string;

    @Column()
    city!: string;

    @Column({ nullable: true })
    province?: string;

    @Column({ nullable: true })
    postal_code?: string;

    @Column()
    type!: UserRole;

    @Column()
    disabled!: boolean;

    @Column()
    timestamp!: number;
}
