import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { createConnection } from 'mysql2/promise';

async function ensureDatabase() {
  const connection = await createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await connection.end();
}

async function bootstrap() {
  await ensureDatabase();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);

  const logger = new Logger('Bootstrap');
  const url = `http://localhost:${process.env.PORT ?? 3000}/graphql`;
  const clickableLink = `\x1b]8;;${url}\x1b\\GraphiQL\x1b]8;;\x1b\\`;
  logger.log(`\x1b[36m${clickableLink}\x1b[0m`);
}
bootstrap();
