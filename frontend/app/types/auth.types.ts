import { AlbumsDTO } from "./files.types";

export interface SingUpData {
  firstName: string;
  lastName: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;
  image: File | null;
}

export interface LogInData {
  emailAddress: string;
  password: string;
}

export interface VerificationCodeData {
  verificationToken: string;
  authCode: string;
}

export interface ResetPassword {
  emailAddress: string;
}

export interface ResetPasswordUserDTO {
  resetToken: string;
}

export interface ResetPasswordDTO {
  firstName: string;
  emailAddress: string;
  imageLink: string;
}

export interface ChnageResetPasswordDTO {
  emailAddress: string;
  password: string;
  confirmPassword: string;
}

export interface UserDataDTO {
  firstName: string;
  lastName: string;
  emailAddress: string;
  imageLink: string;
  authProvider: string;
  photoAlbums: AlbumsDTO[];
  videoAlbums: AlbumsDTO[];
  strorage: number;
  userStorageComsumeSize: number;
  isAdmin: true;
}

export interface UpdatePasswordDTO {
  previousPassword: string;
  newPassword: string;
  confirmPassword: string;
}
