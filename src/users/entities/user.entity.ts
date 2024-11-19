import { Role } from '../../enums/role';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  role: Role;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  birthDate: Date;

  @Column()
  city: string;

  @Column()
  zipCode: string;
}
