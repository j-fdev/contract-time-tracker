import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

import type { PunchType } from '../types/punch.types.js';

@Entity('e_punches')
export class Punch {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    project_id!: ObjectId;

    @Column()
    timesheet_id!: ObjectId;

    /** Start time, Unix seconds. */
    @Column()
    punch_in!: number;

    /** End time, Unix seconds. 0 while the punch is still running. */
    @Column()
    punch_out!: number;

    @Column()
    type!: PunchType;

    @Column()
    notes!: string;

    /** Creation time, Unix seconds. */
    @Column()
    timestamp!: number;
}
