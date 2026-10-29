import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/users.schema';
import { UploadService } from './user.UploadService';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { MediaService } from 'src/media/media.service';
import { Media, fileSchema } from 'src/media/schema/image.schema';
import { AIService } from 'src/ai/ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Media.name, schema: fileSchema },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    EmailModule,
  ],
  providers: [UserService, UploadService, JwtStrategy, MediaService, AIService],
  controllers: [UserController],
})
export class UserModule {}
