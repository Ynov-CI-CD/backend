import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
}
