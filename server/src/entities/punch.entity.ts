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

    @Column()
    punch_in!: number;

    @Column()
    punch_out!: number;

    @Column()
    type!: PunchType;

    @Column()
    notes!: string;

    @Column()
    timestamp!: number;
}
