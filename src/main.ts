import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.APP_PORT);
  const hostname = String(process.env.APP_CLIENT);
  const appName = process.env.APP_NAME;
  const cors = {
    url: `${hostname}/`,
    methods: `GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS`,
  };

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );

  app.use(helmet());

  app.use(cookieParser());

  app.enableCors(cors);

  await app.listen(port, hostname, () =>
    console.log(`${appName} running on: ${hostname}`)
  );
}

bootstrap();
