import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

/** Groups a project's punches by week (Monday to Sunday). */
@Entity('e_timesheets')
export class Timesheet {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    project_id!: ObjectId;

    @Column()
    year!: number;

    /** 0-based week index from the first Monday of `year`. */
    @Column()
    week_period!: number;

    @Column()
    sum!: number;

    @Column()
    interval!: number;

    /** Creation time, Unix seconds. */
    @Column()
    timestamp!: number;
}
