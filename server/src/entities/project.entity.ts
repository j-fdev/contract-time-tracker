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

    /** Where the project's files are on your computer, e.g. C:\Clients\Acme\Website */
    @Column({ nullable: true })
    folder_path?: string;

    @Column()
    active!: boolean;

    @Column()
    timestamp!: number;
}
