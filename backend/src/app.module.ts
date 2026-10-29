import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MediaModule } from './media/media.module';
import { AlbumModule } from './album/album.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    MediaModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
        onConnectionCreate: (connection: any) => {
          console.log('Connected to MongoDB DataBase');

          return connection;
        },
      }),
    }),
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: '/home/samundra/Desktop/Storage',
      serveRoot: '/',
    }),
    AlbumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
