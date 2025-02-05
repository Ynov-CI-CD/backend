import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john-doe@exemple.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  password: string;

  @ApiProperty({ example: 'John', description: 'First Name' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last Name' })
  lastName: string;

  @ApiProperty({ example: '1999-01-01', description: 'Birth Date' })
  birthDate: Date;

  @ApiProperty({ example: 'Montpellier', description: 'City' })
  city: string;

  @ApiProperty({ example: '34000', description: 'Zip Code' })
  zipCode: string;
}
