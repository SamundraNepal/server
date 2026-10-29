import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { ResetPasswordDTO } from './dto/resetPassword.dto';
import ResetPasswordHtml from './templates/resetPassword';
import OtpVerificationHtml from './templates/verificationCode';
import AccountActivatedHtml, {
  AccountDeactivatedHtml,
  AccountDeletedHtml,
  StorageCapacityUpdatedHtml,
} from './templates/accountActivated';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('EMAIL_API'));
  }

  async sendVerificationCode(data: {
    emailAddress: string;
    userName: string;
    otp: string;
  }) {
    return await this.resend.emails.send({
      from: 'Memories <noreply@media.samundra.dev>',
      to: data.emailAddress,
      subject: 'Verification Code',
      html: OtpVerificationHtml({ userName: data.userName, otp: data.otp }),
    });
  }

  async sendPasswordResetLink(data: ResetPasswordDTO) {
    return await this.resend.emails.send({
      from: 'Memories <noreply@media.samundra.dev>',
      to: data.emailAddress,
      subject: 'Password Reset Link',
      html: ResetPasswordHtml(data),
    });
  }

  async sendAccountActivation(data: {
    emailAddress: string;
    userName: string;
    storage: number;
  }) {
    return await this.resend.emails.send({
      from: 'Memories <noreply@media.samundra.dev>',
      to: data.emailAddress,
      subject: 'Account Activation',
      html: AccountActivatedHtml({
        userName: data.userName,
        storage: data.storage,
      }),
    });
  }

  async sendAccountDeActivation(data: {
    emailAddress: string;
    userName: string;
  }) {
    return await this.resend.emails.send({
      from: 'Memories <noreply@media.samundra.dev>',
      to: data.emailAddress,
      subject: 'Account DeActivation',
      html: AccountDeactivatedHtml({
        userName: data.userName,
      }),
    });
  }

  async sendAccountDeletion(data: { emailAddress: string; userName: string }) {
    return await this.resend.emails.send({
      from: 'Memories <noreply@media.samundra.dev>',
      to: data.emailAddress,
      subject: 'Account Deletion',
      html: AccountDeletedHtml({
        userName: data.userName,
      }),
    });
  }

  async sendAccountStorageUpdate(data: {
    emailAddress: string;
    userName: string;
    storage: number;
  }) {
    return await this.resend.emails.send({
      from: 'Memories <noreply@media.samundra.dev>',
      to: data.emailAddress,
      subject: 'Account Deletion',
      html: StorageCapacityUpdatedHtml({
        userName: data.userName,
        storage: data.storage,
      }),
    });
  }
}
