import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);


  // This allows traffic from any other origin
  app.enableCors({ origin: configService.get<string>('FRONTEND_URL'), credentials: true });

  // This allows us to read cookies
  // 1. Properly fetch the ConfigService from the app instance
  const cookieSecretKey = configService.get<string>('COOKIE_SECRET_KEY');
  app.use(cookieParser(cookieSecretKey));

  await app.listen(process.env.PORT ?? 7000, '0.0.0.0');
}
bootstrap();
