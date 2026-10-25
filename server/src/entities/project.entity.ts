import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('e_projects')
export class Project {
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column()
    client_id!: ObjectId;

    @Column()
    project_name!: string;

    @Column()
    description!: string;

    @Column()
    notes!: string;

    @Column()
    hour_rate!: number;

    @Column()
    active!: boolean;

    @Column()
    timestamp!: number;
}
