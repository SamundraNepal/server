import { Module } from '@nestjs/common';
import { AlbumService } from './album.service';
import { AlbumController } from './album.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Media, fileSchema } from 'src/media/schema/image.schema';
import { User, UserSchema } from 'src/user/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Media.name, schema: fileSchema },
      { name: User.name, schema: UserSchema },
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
  controllers: [AlbumController],
  providers: [AlbumService, JwtService],
})
export class AlbumModule {}
