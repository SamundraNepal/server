import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/users.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const adminUser = await this.userModel.findById(user?.userID);

    if (!adminUser?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
