import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('e_projects')
export class Project {
    @ObjectIdColumn()
    _id!: ObjectId;

    /** The client (a User with type "Client") the project is billed to. */
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

    /** Creation time, Unix seconds. */
    @Column()
    timestamp!: number;
}
