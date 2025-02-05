import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: "L'email de l'utilisateur",
    example: 'john-doe@exemple.com',
  })
  email: string;

  @ApiProperty({
    description: "Le mot de passe de l'utilisateur",
    example: '123456',
  })
  password: string;

  @ApiProperty({
    description: "Le prénom de l'utilisateur",
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: "Le nom de l'utilisateur",
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: "La date de naissance de l'utilisateur",
    example: '2000-01-01',
  })
  birthDate: Date;

  @ApiProperty({
    description: "La ville de l'utilisateur",
    example: 'Paris',
  })
  city: string;

  @ApiProperty({
    description: "Le code postal de l'utilisateur",
    example: '75000',
  })
  zipCode: string;
}
