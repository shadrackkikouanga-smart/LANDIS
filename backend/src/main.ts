import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';



async function bootstrap() {


  const app = await NestFactory.create(
    AppModule,
  );


  // Autoriser le frontend Next.js
  app.enableCors({

    origin: 'http://localhost:3001',

    credentials: true,

  });



  app.useGlobalPipes(
    new ValidationPipe(),
  );



  const config =
    new DocumentBuilder()

      .setTitle('LANDIS API')

      .setDescription(
        'API de gestion de lotissement LANDIS',
      )

      .setVersion('1.0')

      .addBearerAuth()

      .build();



  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );



  SwaggerModule.setup(
    'api',
    app,
    document,
  );



  await app.listen(
    process.env.PORT ?? 3000,
  );



}

bootstrap();