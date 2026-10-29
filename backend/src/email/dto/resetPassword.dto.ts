import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResetPasswordDTO {
  @IsEmail()
  emailAddress!: string;

  @IsNotEmpty()
  userName!: string;

  
  @IsNotEmpty()
  resetLink!: string;
}
