import { RoleEnum } from '../../enums/role.enum';
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
  role: RoleEnum;

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
