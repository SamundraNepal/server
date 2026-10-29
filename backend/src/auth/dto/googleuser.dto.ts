// googleUser.dto.ts

import { IsEmail, IsNotEmpty } from 'class-validator';

export class GoogleUserDTO {
  @IsNotEmpty()
  googleId!: string;
  @IsNotEmpty()
  @IsEmail()
  emailAddress!: string;
  @IsNotEmpty()
  firstName!: string;
  @IsNotEmpty()
  lastName!: string;
  @IsNotEmpty()
  image!: string;
}

export class AdminUpdateUserDTO {
  @IsNotEmpty()
  _id!: string;
  @IsNotEmpty()
  emailAddress!: string;
  firstName!: string;
  @IsNotEmpty()
  lastName!: string;
  @IsNotEmpty()
  imageLink!: string;
  @IsNotEmpty()
  isUserActive!: boolean;
  @IsNotEmpty()
  storage!: number;
  @IsNotEmpty()
  isDelete!: boolean;
}
