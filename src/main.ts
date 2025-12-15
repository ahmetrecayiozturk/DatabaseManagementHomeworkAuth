import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // DTO'lara otomatik dönüşüm
    }),
  );

  // Session Configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'super-secret-change-this',
      resave: false,
      saveUninitialized: false,
      name: 'sessionId',
      cookie: {
        maxAge: 3600000, // 1 saat
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      },
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // İzin verilen methodlar
    allowedHeaders: ['Content-Type', 'Authorization'], // İzin verilen header'lar
  });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`Uygulama http://localhost:${PORT} adresinde çalışıyor`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('  Memory store kullanılıyor (Production için Redis kullanın!)');
}

bootstrap();
