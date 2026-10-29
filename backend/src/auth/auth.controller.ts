import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AdminUpdateUserDTO, GoogleUserDTO } from './dto/googleuser.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { AdminGuard } from './auth.admin.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    // We'll handle the authenticated Google user here
    const googleUser = req.user as GoogleUserDTO;
    const { approved, verificationToken } =
      await this.authService.createGoogleUser(googleUser);

    if (!approved) {
      return res.redirect(
        `${this.configService.get<string>('FRONTEND_URL')}/awaitingApprovalPage`,
      );
    }

    // double check if user is approved to log in or not
    return res.redirect(
      `${this.configService.get<string>('FRONTEND_URL')}/Authenticate?verificationToken=${verificationToken}`,
    );
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async getUserData(@Req() req) {
    const userData = await this.authService.UserData(req?.user?.userID);
    return { message: userData, code: 201 };
  }

  @Post('admindata')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAdminData(@Req() req) {
    const adminData = await this.authService.getAdminDatas(req?.user?.userID);
    return { message: adminData, code: 201 };
  }

  @Post('updateUsers')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateAdminUsers(@Body() data: AdminUpdateUserDTO) {
    const adminData = await this.authService.adminUserUpdate(data);
    return { message: 'User Data Updated', id: adminData, code: 201 };
  }
}
