import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.modules';
import { setupSwagger } from './commons/utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const PORT = configService.get('SERVER_PORT');

  setupSwagger(app);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(PORT);

  if (configService.get('NODE_ENV') === 'development') {
    Logger.log(`Application running on port ${PORT}, http://localhost:${PORT}`);
    Logger.log(`Go to API Docs : http://localhost:${PORT}/swagger`);
  }
}
bootstrap();
