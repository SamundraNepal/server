import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { MediaService } from './media.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/users.schema';
import { fileSchema, Media } from './schema/image.schema';

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
  ],

  controllers: [MediaController],
  providers: [JwtStrategy, MediaService],
})
export class MediaModule {}
