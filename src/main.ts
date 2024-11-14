import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );
  const configService = app.get(ConfigService);
  const logger = new Logger('Nest application');
  app.useGlobalPipes(new ValidationPipe());

  await app.listen({ host: '0.0.0.0', port: configService.get('PORT') }, () => {
    logger.log(`server started on ${configService.get('PORT')} PORT`);
  });
}
bootstrap();
