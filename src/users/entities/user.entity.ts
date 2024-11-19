import { Role } from '../../enums/role';

export class User {
  id: number;
  password: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  birthDate: Date;
  city: string;
  zipCode: string;
}
