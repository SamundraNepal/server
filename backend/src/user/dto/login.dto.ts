import { IsEmail, MinLength } from 'class-validator';

export class LogInDTO {
  @IsEmail()
  emailAddress!: string;

  @MinLength(2)
  password!: string;
}
