import { IsNotEmpty, IsString } from 'class-validator';

export class VerificationDTO {
  @IsString()
  @IsNotEmpty()
  verificationToken!: string;

  @IsString()
  @IsNotEmpty()
  authCode!: string;
}
