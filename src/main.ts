import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);

  const logger = new Logger('Bootstrap');
  const url = `http://localhost:${process.env.PORT}/graphql`;
  const clickableLink = `\x1b]8;;${url}\x1b\\GraphiQL\x1b]8;;\x1b\\`;
  logger.log(`\x1b[36m${clickableLink}\x1b[0m`);
}
bootstrap(); 
